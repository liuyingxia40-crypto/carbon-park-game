import Phaser from 'phaser';
import {
  CAMERA_PAN_LERP,
  CAMERA_ZOOM_DEFAULT,
  CAMERA_ZOOM_LERP,
  CAMERA_ZOOM_MAX,
  CAMERA_ZOOM_MIN,
  WORLD_H,
  WORLD_W,
} from '../constants';
import type { MapWorldBounds } from '../iso/mapBounds';
import { getParkCenterWorld } from '../iso/isoMath';

export type WorldPoint = { x: number; y: number };

const DRAG_THRESHOLD = 5;

export class IsoCameraController {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private targetZoom = CAMERA_ZOOM_DEFAULT;
  private currentZoom = CAMERA_ZOOM_DEFAULT;
  private targetScrollX = 0;
  private targetScrollY = 0;
  private focusPoint: WorldPoint = getParkCenterWorld();

  private dragging = false;
  private dragMoved = false;
  private lastX = 0;
  private lastY = 0;
  private panStartScrollX = 0;
  private panStartScrollY = 0;

  constructor(scene: Phaser.Scene) {
    this.cam = scene.cameras.main;
    this.cam.setBounds(0, 0, WORLD_W, WORLD_H);
    this.applyCenter();
    this.applyZoom(this.currentZoom);
  }

  centerOnPark() {
    this.centerOnWorld(getParkCenterWorld());
  }

  centerOnWorld(point: WorldPoint) {
    this.focusPoint = point;
    this.applyCenter();
    this.cam.setScroll(this.targetScrollX, this.targetScrollY);
  }

  /** 让整张地图铺满视口（约 80%+ 画面） */
  fitToMap(bounds: MapWorldBounds, padding = 0.94) {
    const { w, h } = this.viewSize();
    const mapW = bounds.maxX - bounds.minX;
    const mapH = bounds.maxY - bounds.minY;
    const zoom = Math.min(w / mapW, h / mapH) * padding;
    this.targetZoom = Phaser.Math.Clamp(zoom, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX);
    this.currentZoom = this.targetZoom;
    this.applyZoom(this.currentZoom);
    this.centerOnWorld({ x: bounds.centerX, y: bounds.centerY });
  }

  /** 画布 RESIZE 后必须用真实视口尺寸重算滚动 */
  onResize() {
    this.applyCenter();
    this.clampScroll();
    this.cam.setScroll(this.targetScrollX, this.targetScrollY);
  }

  private viewSize() {
    return { w: this.cam.width, h: this.cam.height };
  }

  private applyCenter() {
    const { w, h } = this.viewSize();
    this.targetScrollX = this.focusPoint.x - w / (2 * this.currentZoom);
    this.targetScrollY = this.focusPoint.y - h / (2 * this.currentZoom);
    this.clampScroll();
  }

  bindInput(scene: Phaser.Scene) {
    scene.input.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, _dy: number, dz: number) => {
      const delta = dz > 0 ? -0.06 : 0.06;
      this.targetZoom = Phaser.Math.Clamp(
        this.targetZoom + delta,
        CAMERA_ZOOM_MIN,
        CAMERA_ZOOM_MAX,
      );
    });

    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.leftButtonDown()) {
        this.dragging = true;
        this.dragMoved = false;
        this.lastX = p.x;
        this.lastY = p.y;
        this.panStartScrollX = this.targetScrollX;
        this.panStartScrollY = this.targetScrollY;
      }
    });

    scene.input.on('pointerup', () => {
      this.dragging = false;
    });

    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.dragging || !p.isDown) return;
      const dx = p.x - this.lastX;
      const dy = p.y - this.lastY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        this.dragMoved = true;
      }
      this.targetScrollX = this.panStartScrollX - dx / this.currentZoom;
      this.targetScrollY = this.panStartScrollY - dy / this.currentZoom;
      this.clampScroll();
    });
  }

  didDragThisRelease() {
    return this.dragMoved;
  }

  resetDragFlag() {
    this.dragMoved = false;
  }

  worldPoint(pointer: Phaser.Input.Pointer) {
    return this.cam.getWorldPoint(pointer.x, pointer.y);
  }

  private clampScroll() {
    const { w, h } = this.viewSize();
    const vw = w / this.currentZoom;
    const vh = h / this.currentZoom;
    this.targetScrollX = Phaser.Math.Clamp(this.targetScrollX, 0, Math.max(0, WORLD_W - vw));
    this.targetScrollY = Phaser.Math.Clamp(this.targetScrollY, 0, Math.max(0, WORLD_H - vh));
  }

  private applyZoom(zoom: number) {
    this.cam.setZoom(zoom);
    this.applyCenter();
    this.clampScroll();
  }

  update() {
    this.currentZoom = Phaser.Math.Linear(this.currentZoom, this.targetZoom, CAMERA_ZOOM_LERP);
    if (Math.abs(this.currentZoom - this.targetZoom) > 0.001) {
      this.applyZoom(this.currentZoom);
    }

    const sx = Phaser.Math.Linear(this.cam.scrollX, this.targetScrollX, CAMERA_PAN_LERP);
    const sy = Phaser.Math.Linear(this.cam.scrollY, this.targetScrollY, CAMERA_PAN_LERP);
    this.cam.setScroll(sx, sy);
  }
}

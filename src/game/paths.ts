/** 城市地图 */
import Phaser from 'phaser';

export const CITY_MAP_JSON_URL = '/assets/maps/city_map.json';
export const CITY_MAP_KEY = 'city_map';

export const CITY_BACKGROUND_URL = '/assets/tiles/city_background.png';
export const CITY_BACKGROUND_KEY = 'city_background';

export const CITY_IMAGE_LAYER_NAME = '图像图层 1';
export const CITY_BUILDABLE_LAYER_NAME = 'Buildable';

/** 建筑 PNG（Vite public → 访问路径 /assets/sprites/xxx.png） */
export const BUILDING_KEYS = {
  factory_small: 'factory_small',
  factory_medium: 'factory_medium',
  factory_large: 'factory_large',
  warehouse: 'warehouse',
  power_plant: 'power_plant',
  refinery: 'refinery',
} as const;

export type BuildingKey = (typeof BUILDING_KEYS)[keyof typeof BUILDING_KEYS];

export type BuildingPlaceMode = 'auto_factory' | BuildingKey;

export const BUILDING_URLS: Record<BuildingKey, string> = {
  [BUILDING_KEYS.factory_small]: '/assets/sprites/factory_small.png',
  [BUILDING_KEYS.factory_medium]: '/assets/sprites/factory_medium.png',
  [BUILDING_KEYS.factory_large]: '/assets/sprites/factory_large.png',
  [BUILDING_KEYS.warehouse]: '/assets/sprites/warehouse.png',
  [BUILDING_KEYS.power_plant]: '/assets/sprites/power_plant.png',
  [BUILDING_KEYS.refinery]: '/assets/sprites/refinery.png',
};

export const BUILDING_LABELS: Record<BuildingPlaceMode, string> = {
  auto_factory: '自动工厂(小/中/大)',
  [BUILDING_KEYS.factory_small]: '小工厂',
  [BUILDING_KEYS.factory_medium]: '中工厂',
  [BUILDING_KEYS.factory_large]: '大工厂',
  [BUILDING_KEYS.warehouse]: '仓库',
  [BUILDING_KEYS.power_plant]: '电厂',
  [BUILDING_KEYS.refinery]: '精炼厂',
};

export function preloadBuildingSprites(scene: Phaser.Scene) {
  const cacheBust = `?v=${Date.now()}`;
  for (const key of Object.values(BUILDING_KEYS)) {
    scene.load.image(key, `${BUILDING_URLS[key]}${cacheBust}`);
  }
}

export function isBuildingTextureReady(scene: Phaser.Scene, key: BuildingKey): boolean {
  if (!scene.textures.exists(key)) return false;
  const src = scene.textures.get(key).getSourceImage() as HTMLImageElement | undefined;
  return Boolean(src && src.width > 4 && src.height > 4);
}

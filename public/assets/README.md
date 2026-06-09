# 游戏资源目录（public/assets）

Vite 会把 `public/` 下的文件原样复制到网站根路径。

## 城市地图

| 文件 | 路径 |
|------|------|
| Tiled 地图 | `public/assets/maps/city_map.json` |
| 城市背景 | `public/assets/tiles/city_background.png` |

图层要求：

- **图像图层 1** — 整张城市背景（imagelayer）
- **Buildable** — 可建造区域（objectgroup，矩形或多边形）

运行 `npm run dev` 后，点击 Buildable 区域内可放置占位工厂。

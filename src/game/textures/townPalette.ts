/** Pocket City 风 · 明亮工业小镇色板 */
export const TOWN = {
  outline: 0x2a3238,
  sun: 0xfffce8,
  shadow: 0x3a4858,

  grass: { top: 0x8ed878, left: 0x72c060, right: 0xa0ec90 },
  grassB: { top: 0x82d070, left: 0x68b458, right: 0x96e488 },
  grassC: { top: 0x96e488, left: 0x7ac870, right: 0xb0f0a0 },

  /** 深灰沥青路 */
  road: { top: 0x6a7078, left: 0x525860, right: 0x828890 },
  roadMajor: { top: 0x5e646c, left: 0x484e56, right: 0x767c84 },
  roadDash: 0xf0d848,
  roadEdge: 0xe8ece8,

  industrial: { top: 0x9aa0a8, left: 0x7e848c, right: 0xb4bac2 },
  industrialMark: 0x686e76,

  river: { top: 0x68c8f0, left: 0x48a8d8, right: 0x88e0ff },
  riverFoam: 0xe8f8ff,
} as const;

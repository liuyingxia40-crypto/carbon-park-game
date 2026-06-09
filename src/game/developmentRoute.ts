export type DevRoute = 'heavy' | 'green' | 'tech';

export type RouteModifiers = {
  moneyMult: number;
  pollutionMult: number;
  greenMult: number;
  powerProdMult: number;
  buildCostMult: number;
};

export const DEV_ROUTES: Record<
  DevRoute,
  { id: DevRoute; name: string; tagline: string; description: string; mods: RouteModifiers }
> = {
  heavy: {
    id: 'heavy',
    name: '重工业路线',
    tagline: '高产高排 · 钢铁煤炭主导',
    description: '收益 +15%，污染 +12%，绿色产出 -15%',
    mods: { moneyMult: 1.15, pollutionMult: 1.12, greenMult: 0.85, powerProdMult: 1.05, buildCostMult: 0.95 },
  },
  green: {
    id: 'green',
    name: '绿色能源路线',
    tagline: '低碳转型 · 光伏回收优先',
    description: '污染 -25%，绿色 +35%，收益 -8%',
    mods: { moneyMult: 0.92, pollutionMult: 0.75, greenMult: 1.35, powerProdMult: 1.08, buildCostMult: 1.05 },
  },
  tech: {
    id: 'tech',
    name: '高科技工业路线',
    tagline: '智慧制造 · 能效与绿科并进',
    description: '收益 +8%，污染 -10%，绿色 +10%，科技建筑效率 +5%',
    mods: { moneyMult: 1.08, pollutionMult: 0.9, greenMult: 1.1, powerProdMult: 1.12, buildCostMult: 1.0 },
  },
};

export function routeLabel(route: DevRoute | null): string {
  if (!route) return '未选择发展路线';
  return DEV_ROUTES[route].name;
}

export function getRouteModifiers(route: DevRoute | null): RouteModifiers {
  if (!route) {
    return { moneyMult: 1, pollutionMult: 1, greenMult: 1, powerProdMult: 1, buildCostMult: 1 };
  }
  return { ...DEV_ROUTES[route].mods };
}

/** 路线对齐建筑获得小幅加成 */
export function routeBuildingMult(route: DevRoute | null, buildingTier: 'chain' | 'green' | 'advanced'): number {
  if (!route) return 1;
  if (route === 'heavy' && buildingTier === 'chain') return 1.08;
  if (route === 'green' && buildingTier === 'green') return 1.12;
  if (route === 'tech' && buildingTier === 'advanced') return 1.1;
  if (route === 'tech' && buildingTier === 'green') return 1.05;
  return 1;
}

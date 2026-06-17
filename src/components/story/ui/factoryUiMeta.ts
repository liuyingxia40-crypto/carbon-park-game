import type { FactoryId } from '../../../game/story/phase1Script';

export type FactoryBubbleIcon = 'bolt' | 'leaf' | 'gear';

export type FactoryUiMeta = {
  title: string;
  bubbleText: string;
  bubbleIcon: FactoryBubbleIcon;
  showUpArrow: boolean;
};

export const FACTORY_UI_META: Record<FactoryId, FactoryUiMeta> = {
  factory_coal: {
    title: '燃煤电厂',
    bubbleText: '效率可升级',
    bubbleIcon: 'bolt',
    showUpArrow: true,
  },
  factory_chemical: {
    title: '化工厂',
    bubbleText: '减排改造',
    bubbleIcon: 'leaf',
    showUpArrow: true,
  },
  factory_heavy: {
    title: '重型制造厂',
    bubbleText: '设备可升级',
    bubbleIcon: 'gear',
    showUpArrow: true,
  },
};

export function factoryStarCount(
  factoryId: FactoryId,
  initialRetrofitDone: FactoryId[],
  deepOptimizedFactory: FactoryId | null,
): number {
  if (deepOptimizedFactory === factoryId) return 3;
  if (initialRetrofitDone.includes(factoryId)) return 2;
  return 1;
}

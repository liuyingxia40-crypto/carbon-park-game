export type FactoryCopy = {
  problem: string;
  solutionName: string;
};

export const FACTORY_COPY: Record<string, FactoryCopy> = {
  factory_coal: {
    problem: '燃煤设备老旧，能源效率低，排放强度高。',
    solutionName: '接入绿电与节能设备',
  },
  factory_chemical: {
    problem: '生产过程废气处理不足，存在较高过程排放。',
    solutionName: '废气处理与资源回收系统',
  },
  factory_heavy: {
    problem: '设备能耗高，生产过程碳排放集中。',
    solutionName: '碳捕集与能耗监测系统',
  },
};

export function getFactoryCopy(id: string): FactoryCopy {
  return (
    FACTORY_COPY[id] ?? {
      problem: '该工厂碳排放强度较高，需要进行低碳改造。',
      solutionName: '综合节能与清洁生产改造',
    }
  );
}

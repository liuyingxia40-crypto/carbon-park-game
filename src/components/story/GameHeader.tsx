import { formatWanYuan } from '../../game/story/compliance';
import {
  complianceLabel,
  INITIAL_EMISSION,
  PHASE_LABEL,
  PHASE_PROGRESS,
  TARGET_EMISSION,
  stageIndex,
} from '../../game/story/phase1Script';
import type { GameState } from '../../game/story/gameState';
import './GameHeader.css';

type Props = {
  state: GameState;
};

export function GameHeader({ state }: Props) {
  const compliance = complianceLabel(state.emission);
  const currentIdx = stageIndex(state.stageId);
  const objective = getCurrentObjective(state);
  const isNonCompliant = compliance === '未达标';

  return (
    <header className="hud">
      <div className="hud__top-row">
        <div className="hud__panel hud__panel--brand">
          <div className="hud__icon" aria-hidden>
            <svg viewBox="0 0 48 48" fill="none">
              <rect x="6" y="22" width="16" height="18" rx="3" fill="#4a6a58" stroke="#b88945" strokeWidth="2" />
              <rect x="26" y="12" width="16" height="28" rx="3" fill="#6b8a72" stroke="#b88945" strokeWidth="2" />
              <path d="M10 18h8M30 8h8" stroke="#c99a4a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="38" cy="10" r="5" fill="#f3d58a" stroke="#8a5a36" strokeWidth="2" />
            </svg>
          </div>
          <div className="hud__titles">
            <h1 className="hud__title">低碳工业园改造计划</h1>
            <p className="hud__subtitle">{PHASE_LABEL}</p>
          </div>
        </div>

        <div className="hud__panel hud__panel--resources">
          <HudStat label="资金" value={formatWanYuan(state.funds)} />
          <HudStat
            label="排放"
            value={`${state.emission}`}
            suffix={`/ ${TARGET_EMISSION}`}
            accent="amber"
          />
          <HudStat label="收益" value={String(state.revenue)} accent="blue" />
          <HudStat
            label="合规"
            value={compliance}
            accent={compliance === '已达标' ? 'green' : compliance === '接近达标' ? 'amber' : 'red'}
            pulse={isNonCompliant}
          />
        </div>
      </div>

      <div className="hud__bottom-row">
        <div className="hud__panel hud__panel--objective">
          <p className="hud__objective-line">
            <span className="hud__objective-label">当前目标：</span>
            <span className="hud__objective-text">{objective}</span>
          </p>
        </div>

        <div className="hud__panel hud__panel--phase">
          <nav className="hud__flow" aria-label="阶段进度">
            <span className="hud__flow-prefix">阶段：</span>
            {PHASE_PROGRESS.map((step, i) => {
              const isCurrent = step.id === state.stageId;
              const isDone = i < currentIdx || (step.id === 'report' && state.stageId === 'report');
              return (
                <span key={step.id} className="hud__flow-segment">
                  {i > 0 && <span className="hud__flow-arrow" aria-hidden>→</span>}
                  <span
                    className={`hud__flow-step${isCurrent ? ' hud__flow-step--current' : ''}${isDone ? ' hud__flow-step--done' : ''}`}
                  >
                    {step.label}
                  </span>
                </span>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function HudStat({
  label,
  value,
  suffix,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: 'green' | 'amber' | 'blue' | 'red';
  pulse?: boolean;
}) {
  return (
    <div
      className={`hud-stat${accent ? ` hud-stat--${accent}` : ''}${pulse ? ' hud-stat--pulse' : ''}`}
    >
      <span className="hud-stat__label">{label}</span>
      <span className="hud-stat__value">
        {value}
        {suffix && <span className="hud-stat__suffix">{suffix}</span>}
      </span>
    </div>
  );
}

export function getCurrentObjective(state: GameState): string {
  switch (state.stageId) {
    case 'diagnosis':
      return `将园区排放从 ${INITIAL_EMISSION} 降至 ${TARGET_EMISSION} 以下`;
    case 'retrofit':
      return `完成三座工厂初改（${state.initialRetrofitDone.length}/3）`;
    case 'inspection':
      return '应对监管抽查，选择合规策略';
    case 'deep_opt':
      return state.deepOptimizedFactory
        ? '深度优化已完成，进入碳资产补充'
        : '选择一座工厂进行深度优化';
    case 'carbon':
      return `补充碳资产，排放需低于 ${TARGET_EMISSION}`;
    case 'report':
      return '查看第一阶段改造报告';
  }
}

export type MissionBriefContent = {
  npcName: string;
  problem: string;
  task: string;
  nextStep: string;
};

export function getMissionBrief(state: GameState): MissionBriefContent {
  const base = {
    npcName: 'Carbon Butler',
  };

  switch (state.stageId) {
    case 'diagnosis':
      return {
        ...base,
        problem: `园区总排放 ${state.emission} tCO₂e，超出年度配额 ${state.emission - TARGET_EMISSION} 吨。`,
        task: '完成园区碳排放诊断，摸清主要排放来源。',
        nextStep: '完成引导后自动进入初改阶段，点击地图工厂开始改造。',
      };
    case 'retrofit':
      return {
        ...base,
        problem: '三座高排放工厂尚未完成初步低碳改造。',
        task: `为每座工厂选择初改方案（进度 ${state.initialRetrofitDone.length}/3）。`,
        nextStep: '点击地图上带边框的工厂，查看并选择改造方案。',
      };
    case 'inspection':
      return {
        ...base,
        problem: '监管部门对园区改造进度发起抽查，合规压力上升。',
        task: '在抽查事件中选择应对策略，平衡资金与排放。',
        nextStep: '系统将根据当前策略自动应对抽查，随后进入深度优化阶段。',
      };
    case 'deep_opt':
      return {
        ...base,
        problem: '初改完成后，仍有一处重点工厂可进一步深度优化。',
        task: state.deepOptimizedFactory
          ? '深度优化已完成，准备进入碳资产阶段。'
          : '选择一座工厂进行深度优化（仅一次机会）。',
        nextStep: state.deepOptimizedFactory
          ? '等待进入碳资产补充阶段。'
          : '点击地图上「可深改」标记的工厂，确认优化方向。',
      };
    case 'carbon':
      return {
        ...base,
        problem: `当前排放 ${state.emission} tCO₂e，距离目标 ${TARGET_EMISSION} 仍有差距。`,
        task: '选择碳资产补充方案，向合规目标靠近。',
        nextStep: '深度优化完成后将自动进入碳资产补充阶段。',
      };
    case 'report':
      return {
        ...base,
        problem: '第一阶段改造周期结束，需要评估整体成果。',
        task: '查看改造报告，确认排放、资金与合规结果。',
        nextStep: '阅读报告摘要，选择重新开始或返回首页。',
      };
  }
}

export function getDefaultHint(state: GameState): string {
  switch (state.stageId) {
    case 'diagnosis':
      return '完成园区诊断，了解排放来源';
    case 'retrofit':
      return `点击地图工厂选择初改方案（${state.initialRetrofitDone.length}/3）`;
    case 'inspection':
      return '应对监管抽查，选择合规策略';
    case 'deep_opt':
      return state.deepOptimizedFactory
        ? '深度优化已完成，进入碳资产补充'
        : '选择一座工厂进行深度优化';
    case 'carbon':
      return '选择碳资产补充方案，向目标排放靠近';
    case 'report':
      return '查看第一阶段改造报告';
  }
}

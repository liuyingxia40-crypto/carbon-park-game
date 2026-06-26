import { formatWanYuan } from '../../game/story/compliance';
import type { FailureReason } from '../../game/story/compliance';
import './ComplianceFailurePanel.css';

type Props = {
  playerMoney: number;
  requiredCost: number;
  carbonGap: number;
  reason?: FailureReason;
  onReplan: () => void;
  onReturnHome: () => void;
};

const COPY: Record<
  FailureReason,
  { title: string; lines: [string, string] }
> = {
  second_round_funds: {
    title: '资金断裂 · 游戏失败',
    lines: [
      '第一轮低碳改造已全部完成，但当前资金不足以进入深度优化阶段。',
      '园区无法继续推进第二轮改造，本轮经营以失败告终。',
    ],
  },
  compliance: {
    title: '改造计划失败',
    lines: [
      '资金不足，无法完成本轮低碳改造与碳履约。',
      '工业园仍存在碳排放缺口，企业将面临履约风险。',
    ],
  },
};

export function ComplianceFailurePanel({
  playerMoney,
  requiredCost,
  carbonGap,
  reason = 'compliance',
  onReplan,
  onReturnHome,
}: Props) {
  const copy = COPY[reason];

  return (
    <div className="compliance-failure" role="dialog" aria-modal="true" aria-live="assertive">
      <div className="compliance-failure__backdrop" aria-hidden />
      <div className="compliance-failure__panel">
        <span className="compliance-failure__corner compliance-failure__corner--tl" aria-hidden />
        <span className="compliance-failure__corner compliance-failure__corner--tr" aria-hidden />
        <span className="compliance-failure__corner compliance-failure__corner--bl" aria-hidden />
        <span className="compliance-failure__corner compliance-failure__corner--br" aria-hidden />

        <h2 className="compliance-failure__title">{copy.title}</h2>

        <div className="compliance-failure__copy">
          <p>{copy.lines[0]}</p>
          <p>{copy.lines[1]}</p>
        </div>

        <dl className="compliance-failure__stats">
          <div className="compliance-failure__stat">
            <dt>当前资金</dt>
            <dd>{formatWanYuan(playerMoney)}</dd>
          </div>
          <div className="compliance-failure__stat">
            <dt>{reason === 'second_round_funds' ? '第二轮最低所需' : '所需资金'}</dt>
            <dd>{formatWanYuan(requiredCost)}</dd>
          </div>
          <div className="compliance-failure__stat">
            <dt>碳排放缺口</dt>
            <dd>{carbonGap.toLocaleString()} 吨</dd>
          </div>
          <div className="compliance-failure__stat">
            <dt>履约状态</dt>
            <dd className="compliance-failure__stat--bad">未达标</dd>
          </div>
        </dl>

        <div className="compliance-failure__actions">
          <button type="button" className="compliance-failure__btn" onClick={onReplan}>
            重新规划
          </button>
          <button type="button" className="compliance-failure__btn" onClick={onReturnHome}>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

import { formatWanYuan } from '../../game/story/compliance';
import './ComplianceFailurePanel.css';

type Props = {
  playerMoney: number;
  requiredCost: number;
  carbonGap: number;
  onReplan: () => void;
  onReturnHome: () => void;
};

export function ComplianceFailurePanel({
  playerMoney,
  requiredCost,
  carbonGap,
  onReplan,
  onReturnHome,
}: Props) {
  return (
    <div className="compliance-failure" role="dialog" aria-modal="true" aria-live="assertive">
      <div className="compliance-failure__backdrop" aria-hidden />
      <div className="compliance-failure__panel">
        <span className="compliance-failure__corner compliance-failure__corner--tl" aria-hidden />
        <span className="compliance-failure__corner compliance-failure__corner--tr" aria-hidden />
        <span className="compliance-failure__corner compliance-failure__corner--bl" aria-hidden />
        <span className="compliance-failure__corner compliance-failure__corner--br" aria-hidden />

        <h2 className="compliance-failure__title">改造计划失败</h2>

        <div className="compliance-failure__copy">
          <p>资金不足，无法完成本轮低碳改造与碳履约。</p>
          <p>工业园仍存在碳排放缺口，企业将面临履约风险。</p>
        </div>

        <dl className="compliance-failure__stats">
          <div className="compliance-failure__stat">
            <dt>当前资金</dt>
            <dd>{formatWanYuan(playerMoney)}</dd>
          </div>
          <div className="compliance-failure__stat">
            <dt>所需资金</dt>
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

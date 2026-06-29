import { GameButton } from './GameButton';
import './game-ui.css';

type Props = {
  onUpgrade: () => void;
  onInspect: () => void;
  onCarbonPlan: () => void;
  onParkOverview: () => void;
  onFeedback: () => void;
  showCarbonBadge?: boolean;
};

export function BottomActionBar({
  onUpgrade,
  onInspect,
  onCarbonPlan,
  onParkOverview,
  onFeedback,
  showCarbonBadge,
}: Props) {
  return (
    <nav className="bottom-action-bar" aria-label="主操作">
      <GameButton icon="⬆️" label="升级" onClick={onUpgrade} ariaLabel="升级工厂" />
      <GameButton icon="🔍" label="巡检" onClick={onInspect} ariaLabel="园区巡检" />
      <GameButton icon="📊" label="园区概览" onClick={onParkOverview} ariaLabel="园区数据概览" />
      <GameButton
        icon="📋"
        label="碳规划"
        onClick={onCarbonPlan}
        showBadge={showCarbonBadge}
        ariaLabel="碳规划"
      />
      <GameButton icon="💬" label="问题反馈" onClick={onFeedback} ariaLabel="问题反馈" />
    </nav>
  );
}

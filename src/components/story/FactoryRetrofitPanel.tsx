import { formatWanYuan } from '../../game/story/compliance';
import type { ChoiceRecord, DecisionOption, FactoryDef } from '../../game/story/phase1Script';
import { RetrofitDecisionPanel } from './ui/RetrofitDecisionPanel';

type Props = {
  factory: FactoryDef;
  mode: 'initial' | 'deep';
  funds: number;
  currentEmission: number;
  readonly: boolean;
  choice?: ChoiceRecord;
  deepOption?: DecisionOption;
  deepLocked?: boolean;
  deepTargetName?: string;
  onSelect: (option: DecisionOption) => void;
  onInsufficientFunds: (option: DecisionOption) => void;
  onClose: () => void;
};

export function FactoryRetrofitPanel({
  factory,
  mode,
  funds,
  currentEmission,
  readonly,
  choice,
  deepOption,
  deepLocked,
  deepTargetName,
  onSelect,
  onInsufficientFunds,
  onClose,
}: Props) {
  const title = mode === 'deep' ? '深度优化决策' : '低碳改造决策';
  const status =
    readonly && choice
      ? mode === 'deep'
        ? '已深度优化'
        : '已初改'
      : mode === 'deep'
        ? '可深改'
        : '待改造';
  const subtitle = `${factory.title} · 排放 ${factory.emission} tCO₂e · ${status}`;

  const readonlyNote = deepLocked
    ? `深度优化已在「${deepTargetName}」完成，本工厂本轮不可再选。`
    : mode === 'deep'
      ? '该工厂深度优化已完成。'
      : '该工厂初改已完成，无法重复选择。';

  const handleSelect = (option: DecisionOption) => {
    const affordable = funds >= option.cost;
    if (affordable) onSelect(option);
    else onInsufficientFunds(option);
  };

  if (mode === 'deep' && deepOption && !readonly) {
    return (
      <RetrofitDecisionPanel
        title={title}
        subtitle={subtitle}
        options={[deepOption]}
        funds={funds}
        currentEmission={currentEmission}
        onSelect={handleSelect}
        onClose={onClose}
      />
    );
  }

  if (readonly && choice) {
    return (
      <RetrofitDecisionPanel
        title={title}
        subtitle={`${factory.title} · 成本 ${formatWanYuan(choice.cost)}`}
        options={[]}
        funds={funds}
        currentEmission={currentEmission}
        readonly
        choice={choice}
        readonlyNote={readonlyNote}
        onSelect={handleSelect}
        onClose={onClose}
      />
    );
  }

  return (
    <RetrofitDecisionPanel
      title={title}
      subtitle={subtitle}
      options={factory.options}
      funds={funds}
      currentEmission={currentEmission}
      onSelect={handleSelect}
      onClose={onClose}
    />
  );
}

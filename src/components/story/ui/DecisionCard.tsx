import { formatCardCostYuan } from '../../../game/story/compliance';
import type { DecisionOption } from '../../../game/story/phase1Script';
import './game-ui.css';

export type SchemeVariant = 'starter' | 'advanced' | 'defer';

const SCHEME_TAGS: Record<SchemeVariant, string> = {
  starter: '推荐入门',
  advanced: '高减排',
  defer: '有风险',
};

export function getSchemeVariant(option: DecisionOption, index: number, total: number): SchemeVariant {
  if (option.tagTone === 'risk' || option.id.endsWith('_c')) return 'defer';
  if (option.id.endsWith('_b') || option.tagTone === 'balance') return 'advanced';
  if (total === 3 && index === 2) return 'defer';
  if (total === 3 && index === 1) return 'advanced';
  if (total === 1) return 'advanced';
  return 'starter';
}

function buttonLabel(variant: SchemeVariant): string {
  return variant === 'defer' ? '暂缓观察' : '立即实施';
}

type MetricTone = 'cost' | 'reduction' | 'impact' | 'duration' | 'risk';

type CardMetric = {
  label: string;
  value: string;
  tone: MetricTone;
};

function formatReductionPercent(option: DecisionOption, variant: SchemeVariant): string {
  if (variant === 'defer') return '—';
  if (option.reductionPercent != null) return `-${option.reductionPercent}%`;
  if (option.reduction <= 0) return '—';
  return `-${option.reduction}`;
}

function formatCapacityImpact(option: DecisionOption): string {
  if (option.capacityImpactPercent != null) {
    const pct = option.capacityImpactPercent;
    return `产能 ${pct > 0 ? '+' : ''}${pct}%`;
  }
  return '产能 持平';
}

function formatDuration(option: DecisionOption): string {
  if (option.durationDays != null) return `${option.durationDays}天`;
  return '—';
}

function projectedEmission(currentEmission: number, option: DecisionOption): number {
  return Math.max(0, currentEmission - option.reduction);
}

function buildMetrics(option: DecisionOption, variant: SchemeVariant): CardMetric[] {
  if (variant === 'defer') {
    return [
      { label: '费用', value: formatCardCostYuan(option.cost), tone: 'cost' },
      { label: '减排', value: '—', tone: 'reduction' },
      {
        label: '风险',
        value: option.riskDetail ?? '超标风险升高',
        tone: 'risk',
      },
      {
        label: '后果',
        value: option.impactDetail ?? '可能触发整改',
        tone: 'impact',
      },
    ];
  }

  return [
    { label: '费用', value: formatCardCostYuan(option.cost), tone: 'cost' },
    { label: '减排', value: formatReductionPercent(option, variant), tone: 'reduction' },
    { label: '影响', value: formatCapacityImpact(option), tone: 'impact' },
    { label: '工期', value: formatDuration(option), tone: 'duration' },
  ];
}

type Props = {
  option: DecisionOption;
  index: number;
  total: number;
  currentEmission: number;
  affordable: boolean;
  onSelect: () => void;
};

export function DecisionCard({
  option,
  index,
  total,
  currentEmission,
  affordable,
  onSelect,
}: Props) {
  const variant = getSchemeVariant(option, index, total);
  const tag = SCHEME_TAGS[variant];
  const metrics = buildMetrics(option, variant);
  const resultEmission = projectedEmission(currentEmission, option);
  const resultText =
    variant === 'defer'
      ? `排放仍为 ${resultEmission} tCO₂e`
      : `排放降至 ${resultEmission} tCO₂e`;

  return (
    <article
      className={`scheme-card scheme-card--${variant}${affordable ? '' : ' scheme-card--disabled'}`}
    >
      <span className={`scheme-card__type-badge scheme-card__type-badge--${variant}`}>{tag}</span>

      <h3 className={`scheme-card__name scheme-card__name--${variant}`}>{option.name}</h3>
      <p className="scheme-card__desc">{option.description}</p>

      <div className="scheme-card__metrics" role="list">
        {metrics.map((metric) => (
          <div key={metric.label} className="scheme-card__metric" role="listitem">
            <span className="scheme-card__metric-label">{metric.label}</span>
            <span className={`scheme-card__metric-value scheme-card__metric-value--${metric.tone}`}>
              {metric.tone === 'cost' ? (
                <>
                  <span className="scheme-card__cost-icon" aria-hidden>
                    🪙
                  </span>
                  {metric.value}
                </>
              ) : (
                metric.value
              )}
            </span>
          </div>
        ))}
      </div>

      <p className={`scheme-card__outcome scheme-card__outcome--${variant}`}>
        <span className="scheme-card__outcome-label">结果</span>
        <span className="scheme-card__outcome-value">{resultText}</span>
      </p>

      <button
        type="button"
        className={`scheme-card__btn scheme-card__btn--${variant}`}
        onClick={affordable ? onSelect : undefined}
        disabled={!affordable}
        title={affordable ? undefined : '资金不足，无法选择该方案'}
      >
        {buttonLabel(variant)}
      </button>

      {!affordable ? <span className="scheme-card__warn">资金不足</span> : null}
    </article>
  );
}

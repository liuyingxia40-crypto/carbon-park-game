import type { DecisionOption } from '../../../game/story/phase1Script';
import './game-ui.css';

const OPTION_ICONS: Record<string, string> = {
  coal_a: '☀️',
  coal_b: '🏭',
  coal_c: '⏸️',
  coal_deep: '🔋',
  chem_a: '♻️',
  chem_b: '🧪',
  chem_c: '⏸️',
  chem_deep: '💧',
  heavy_a: '🌱',
  heavy_b: '⚙️',
  heavy_c: '⏸️',
  heavy_deep: '📊',
  diag_a: '📋',
  diag_b: '🔍',
  diag_c: '⚡',
  insp_a: '🔧',
  insp_b: '📜',
  insp_c: '⏳',
  carbon_a: '📜',
  carbon_b: '🏅',
  carbon_c: '⏸️',
};

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

function iconForOption(option: DecisionOption): string {
  return OPTION_ICONS[option.id] ?? '🌿';
}

function reductionParts(option: DecisionOption): { label: string; value: string } {
  if (option.reduction <= 0) return { label: '预计减排', value: '—' };
  const pct = Math.min(99, Math.round((option.reduction / 460) * 100));
  const display = pct > 0 ? `-${pct}%` : `-${option.reduction}`;
  return { label: '预计减排', value: display };
}

function buttonLabel(variant: SchemeVariant): string {
  return variant === 'defer' ? '暂缓观察' : '立即实施';
}

type Props = {
  option: DecisionOption;
  index: number;
  total: number;
  affordable: boolean;
  onSelect: () => void;
};

export function DecisionCard({ option, index, total, affordable, onSelect }: Props) {
  const variant = getSchemeVariant(option, index, total);
  const reduction = reductionParts(option);
  const tag = SCHEME_TAGS[variant];

  return (
    <article
      className={`scheme-card scheme-card--${variant}${affordable ? '' : ' scheme-card--disabled'}`}
    >
      <span className={`scheme-card__type-badge scheme-card__type-badge--${variant}`}>{tag}</span>

      <div className={`scheme-card__art scheme-card__art--${variant}`} aria-hidden>
        <span className="scheme-card__icon">{iconForOption(option)}</span>
      </div>

      <h3 className={`scheme-card__name scheme-card__name--${variant}`}>{option.name}</h3>
      <p className="scheme-card__desc">{option.description}</p>

      <div className={`scheme-card__stat scheme-card__stat--${variant}`}>
        <span className="scheme-card__stat-label">{reduction.label}</span>
        <span className="scheme-card__stat-value">{reduction.value}</span>
      </div>

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

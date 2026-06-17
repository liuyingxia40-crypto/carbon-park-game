import { useState } from 'react';

export type HudStat = {
  label: string;
  value: string;
  tone?: 'funds' | 'traffic';
};

export type HudBrand = {
  logo: string;
  title: string;
  subtitle: string;
  logoClassName?: string;
};

type Props = {
  brand: HudBrand;
  stats: HudStat[];
  showHeatmap?: boolean;
};

export function GameHud({ brand, stats, showHeatmap = true }: Props) {
  const [heatmapOn, setHeatmapOn] = useState(false);

  return (
    <header className="shanghai-hud">
      <div className="shanghai-hud__brand">
        <span
          className={`shanghai-hud__logo${brand.logoClassName ? ` ${brand.logoClassName}` : ''}`}
          aria-hidden
        >
          {brand.logo}
        </span>
        <div className="shanghai-hud__titles">
          <span className="shanghai-hud__title">{brand.title}</span>
          <span className="shanghai-hud__subtitle">{brand.subtitle}</span>
        </div>
      </div>

      <div className="shanghai-hud__stats">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      {showHeatmap && (
        <div className="shanghai-hud__heat">
          <span className="shanghai-hud__heat-label">热力</span>
          <button
            type="button"
            className={`shanghai-toggle${heatmapOn ? ' shanghai-toggle--on' : ''}`}
            onClick={() => setHeatmapOn((v) => !v)}
            aria-pressed={heatmapOn}
          >
            <span className="shanghai-toggle__knob" />
            <span className="shanghai-toggle__text">{heatmapOn ? '开' : '关'}</span>
          </button>
        </div>
      )}
    </header>
  );
}

function StatCard({ label, value, tone }: HudStat) {
  return (
    <div className={`shanghai-stat${tone ? ` shanghai-stat--${tone}` : ''}`}>
      <span className="shanghai-stat__label">{label}</span>
      <span className="shanghai-stat__value">{value}</span>
    </div>
  );
}

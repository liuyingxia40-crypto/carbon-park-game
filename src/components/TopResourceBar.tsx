import './TopResourceBar.css';

const STATS = [
  { icon: '💰', label: '金币', value: '$12,500' },
  { icon: '⚡', label: '电力', value: '120 / 200' },
  { icon: '📦', label: '仓储', value: '35 / 100' },
  { icon: '👥', label: '人口', value: '80' },
  { icon: '📅', label: '日期', value: '第 1 天' },
] as const;

export function TopResourceBar() {
  return (
    <header className="top-bar">
      {STATS.map((s) => (
        <div key={s.label} className="top-bar__item">
          <span className="top-bar__icon" aria-hidden>
            {s.icon}
          </span>
          <div className="top-bar__text">
            <span className="top-bar__label">{s.label}</span>
            <span className="top-bar__value">{s.value}</span>
          </div>
        </div>
      ))}
    </header>
  );
}

type SparkChartProps = {
  data: number[];
  label: string;
  unit?: string;
  color?: string;
  height?: number;
  variant?: 'line' | 'area' | 'bar';
};

export function SparkChart({
  data,
  label,
  unit = '',
  color = '#5ac8e8',
  height = 48,
  variant = 'area',
}: SparkChartProps) {
  const w = 200;
  const h = height;
  const pad = 4;
  const values = data.length > 0 ? data : [0];
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;

  const last = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const delta = last - first;

  return (
    <div className="spark-chart">
      <div className="spark-chart__head">
        <span className="spark-chart__label">{label}</span>
        <span className="spark-chart__value">
          {Math.round(last)}
          {unit}
          {values.length > 1 && (
            <em className={delta >= 0 ? 'spark-chart__up' : 'spark-chart__down'}>
              {delta >= 0 ? '↑' : '↓'}
              {Math.abs(Math.round(delta))}
            </em>
          )}
        </span>
      </div>
      <svg className="spark-chart__svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {variant === 'bar' ? (
          values.map((v, i) => {
            const barW = (w - pad * 2) / values.length - 2;
            const x = pad + i * (barW + 2);
            const barH = ((v - min) / range) * (h - pad * 2);
            return (
              <rect
                key={i}
                x={x}
                y={h - pad - barH}
                width={barW}
                height={barH}
                fill={color}
                opacity={0.65}
                rx={1}
              />
            );
          })
        ) : (
          <>
            {variant === 'area' && <path d={areaPath} fill={color} opacity={0.15} />}
            <path d={linePath} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    </div>
  );
}

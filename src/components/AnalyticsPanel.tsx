import { SparkChart } from './SparkChart';
import type { MetricsSeries } from '../game/metricsHistory';

export function AnalyticsPanel({ metrics }: { metrics: MetricsSeries }) {
  const powerSupply = metrics.power;
  const powerGap = metrics.power.map((p, i) => Math.max(0, (metrics.powerDemand[i] ?? 0) - p));

  return (
    <section className="analytics-panel">
      <div className="analytics-panel__head">
        <h2>实时数据洞察</h2>
        <span>REAL-TIME · CARBON ASSET ANALYTICS</span>
      </div>
      <div className="analytics-panel__grid">
        <SparkChart data={metrics.pollution} label="污染指数" color="#e8a060" variant="area" />
        <SparkChart
          data={powerSupply}
          label="电力供应 MW"
          color="#5ab0f0"
          variant="line"
        />
        <SparkChart data={powerGap} label="电力缺口" color="#c07070" variant="bar" />
        <SparkChart data={metrics.green} label="绿色积分" color="#2dd4a8" variant="area" />
        <SparkChart data={metrics.gradeScore} label="城市评级指数" color="#9ab8e8" variant="line" />
        <SparkChart data={metrics.emissionRatio} label="排放占比 %" color="#d0a050" variant="area" />
      </div>
    </section>
  );
}

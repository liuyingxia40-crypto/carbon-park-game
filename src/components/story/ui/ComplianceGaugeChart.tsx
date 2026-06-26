import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { ComplianceGaugeData } from '../../../game/story/dataPanelCharts';
import { CHART_GREEN, CHART_TITLE } from './chartTheme';

const CHART_HEIGHT = '100%';

type Props = ComplianceGaugeData;

export function ComplianceGaugeChart({ progress, metTarget }: Props) {  const statusLabel = metTarget ? '已达标' : '待达标';
  const statusColor = metTarget ? '#3db872' : '#e87840';

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      title: {
        text: '合规进度',
        left: 'center',
        top: 4,
        textStyle: CHART_TITLE,
      },
      series: [
        {
          type: 'gauge',
          center: ['50%', '58%'],
          radius: '78%',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          splitNumber: 5,
          progress: {
            show: true,
            width: 14,
            roundCap: true,
            itemStyle: { color: CHART_GREEN },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 14,
              color: [[1, 'rgba(180, 220, 200, 0.45)']],
            },
          },
          axisTick: { show: false },
          splitLine: {
            length: 8,
            lineStyle: { color: 'rgba(140, 190, 175, 0.5)', width: 1 },
          },
          axisLabel: {
            color: '#5a7a92',
            fontSize: 10,
            distance: 14,
          },
          pointer: {
            show: true,
            length: '58%',
            width: 5,
            itemStyle: { color: CHART_GREEN },
          },
          anchor: {
            show: true,
            size: 10,
            itemStyle: { color: CHART_GREEN, borderColor: '#fff', borderWidth: 2 },
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 22,
            fontWeight: 700,
            color: '#2a5868',
            offsetCenter: [0, '28%'],
          },
          data: [{ value: progress }],
        },
      ],
    }),
    [progress],
  );

  return (
    <div className="compliance-gauge-chart">
      <div className="data-panel-chart-frame">
        <ReactECharts
          option={option}
          style={{ height: CHART_HEIGHT, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
          lazyUpdate
        />
      </div>
      <p className="compliance-gauge-chart__status" style={{ color: statusColor }}>
        {statusLabel}
      </p>
    </div>
  );
}
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { carbonChartYRange } from '../../../game/story/dataPanelCharts';
import type { CarbonTrendData } from '../../../game/story/dataPanelCharts';
import {
  CHART_AXIS,
  CHART_GREEN,
  CHART_GREEN_LIGHT,
  CHART_SPLIT,
  CHART_TARGET,
  CHART_TITLE,
} from './chartTheme';

const CHART_HEIGHT = '100%';

type Props = CarbonTrendData;

export function CarbonTrendChart({ days, values, targetLine }: Props) {
  const yRange = useMemo(() => carbonChartYRange(values, targetLine), [values, targetLine]);

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      title: {
        text: '碳排放趋势',
        left: 'center',
        top: 4,
        textStyle: CHART_TITLE,
      },
      grid: {
        left: 52,
        right: 20,
        top: 44,
        bottom: 28,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: 'rgba(120, 190, 170, 0.55)',
        textStyle: { color: '#2a4a62', fontSize: 12 },
      },
      xAxis: {
        type: 'category',
        data: days,
        boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(140, 190, 175, 0.65)' } },
        axisTick: { show: false },
        axisLabel: {
          color: CHART_AXIS.color,
          fontSize: CHART_AXIS.fontSize,
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value',
        name: 'tCO₂e',
        nameTextStyle: { color: CHART_AXIS.color, fontSize: 10, padding: [0, 0, 0, -8] },
        min: yRange.min,
        max: yRange.max,
        splitLine: { lineStyle: { color: CHART_SPLIT, type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART_AXIS.color, fontSize: CHART_AXIS.fontSize },
      },
      series: [
        {
          name: '碳排放',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: values,
          lineStyle: { color: CHART_GREEN, width: 3 },
          itemStyle: { color: CHART_GREEN, borderColor: '#fff', borderWidth: 2 },
          areaStyle: { color: CHART_GREEN_LIGHT },
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              formatter: `目标 ${targetLine}`,
              color: CHART_TARGET,
              fontSize: 10,
              fontWeight: 700,
            },
            lineStyle: { color: CHART_TARGET, type: 'dashed', width: 2 },
            data: [{ yAxis: targetLine }],
          },
        },
      ],
    }),
    [days, values, targetLine, yRange.min, yRange.max],
  );

  return (
    <div className="data-panel-chart-frame">
      <ReactECharts
        option={option}
        style={{ height: CHART_HEIGHT, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}

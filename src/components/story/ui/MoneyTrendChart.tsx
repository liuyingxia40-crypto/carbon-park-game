import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useMemo } from 'react';
import { moneyChartYMax } from '../../../game/story/dataPanelCharts';
import type { MoneyTrendData } from '../../../game/story/dataPanelCharts';
import { CHART_AXIS, CHART_MONEY, CHART_MONEY_DEEP, CHART_SPLIT, CHART_TITLE } from './chartTheme';

const CHART_HEIGHT = '100%';

type Props = MoneyTrendData;

export function MoneyTrendChart({ labels, values }: Props) {
  const yMax = useMemo(() => moneyChartYMax(values), [values]);

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      title: {
        text: '资金变化',
        left: 'center',
        top: 4,
        textStyle: CHART_TITLE,
      },
      grid: {
        left: 48,
        right: 16,
        top: 44,
        bottom: 36,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: 'rgba(230, 190, 100, 0.55)',
        textStyle: { color: '#2a4a62', fontSize: 12 },
        valueFormatter: (v: number) => `${v} 万元`,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: 'rgba(140, 190, 175, 0.65)' } },
        axisTick: { show: false },
        axisLabel: {
          color: CHART_AXIS.color,
          fontSize: 10,
          interval: 0,
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: CHART_AXIS.color, fontSize: 10 },
        min: 0,
        max: yMax,
        splitLine: { lineStyle: { color: CHART_SPLIT, type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART_AXIS.color, fontSize: CHART_AXIS.fontSize },
      },
      series: [
        {
          name: '资金',
          type: 'bar',
          barWidth: labels.length > 4 ? '62%' : '46%',
          data: values,
          itemStyle: {
            borderRadius: [8, 8, 4, 4],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ffd86b' },
              { offset: 1, color: CHART_MONEY },
            ]),
            shadowColor: 'rgba(232, 168, 48, 0.25)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ffe898' },
                { offset: 1, color: CHART_MONEY_DEEP },
              ]),
            },
          },
        },
      ],
    }),
    [labels, values, yMax],
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

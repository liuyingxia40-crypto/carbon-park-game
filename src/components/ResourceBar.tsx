import type { ChainRates, Resources } from '../game/economy';
import { IconSprite } from './IconSprite';
import { UiSprite } from './UiSprite';
import { UI_FRAMES } from '../game/assets/assetIds';

function formatRate(n: number) {
  if (n === 0) return '0/日';
  return `${n > 0 ? '+' : ''}${n}/日`;
}

type Props = {
  res: Resources;
  rates: ChainRates;
  grade: string;
  tierLabel: string;
};

export function ResourceBar({ res, rates, grade, tierLabel }: Props) {
  return (
    <div className="resource-bar">
      <UiSprite frame={UI_FRAMES.resourceBar} className="resource-bar__bg" height={52}>
        <div className="resource-bar__inner">
          <div className="resource-bar__kpi">
            <IconSprite icon="money" size={22} />
            <div>
              <span className="resource-bar__label">资金</span>
              <strong>¥{res.money.toLocaleString()}</strong>
              <em>{formatRate(rates.money)}</em>
            </div>
          </div>
          <div className="resource-bar__kpi">
            <IconSprite icon="power" size={22} />
            <div>
              <span className="resource-bar__label">电力</span>
              <strong>{Math.floor(res.power)} MW</strong>
              <em>{formatRate(rates.power)}</em>
            </div>
          </div>
          <div className="resource-bar__kpi resource-bar__kpi--warn">
            <IconSprite icon="pollution" size={22} />
            <div>
              <span className="resource-bar__label">污染</span>
              <strong>{Math.floor(res.pollution)}</strong>
              <em>{formatRate(rates.pollution)}</em>
            </div>
          </div>
          <div className="resource-bar__kpi resource-bar__kpi--green">
            <IconSprite icon="green" size={22} />
            <div>
              <span className="resource-bar__label">绿分</span>
              <strong>{Math.floor(res.green)}</strong>
              <em>{formatRate(rates.green)}</em>
            </div>
          </div>
          <div className="resource-bar__meta">
            <span className="resource-bar__grade">{grade}</span>
            <span className="resource-bar__tier">{tierLabel}</span>
          </div>
        </div>
      </UiSprite>
    </div>
  );
}

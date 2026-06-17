import { useState } from 'react';
import { PARK_BG_URL } from '../game/park/paths';
import './StartScene.css';

type Props = {
  onStart: () => void;
};

const HELP_LINES = [
  '点击地图上的旧工厂，选择不同改造方案。',
  '在资金、收益、风险和减排之间做出取舍，',
  '帮助园区完成第一阶段低碳转型。',
];

export function StartScene({ onStart }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="start-scene">
      <div
        className="start-scene__map"
        style={{ backgroundImage: `url(${PARK_BG_URL})` }}
        aria-hidden
      />
      <div className="start-scene__vignette" aria-hidden />
      <div className="start-scene__warm-glow" aria-hidden />
      <div className="start-scene__grain" aria-hidden />

      <div className="start-scene__frame" aria-hidden>
        <span className="start-scene__frame-corner start-scene__frame-corner--tl" />
        <span className="start-scene__frame-corner start-scene__frame-corner--tr" />
        <span className="start-scene__frame-corner start-scene__frame-corner--bl" />
        <span className="start-scene__frame-corner start-scene__frame-corner--br" />
      </div>

      <main className="start-scene__menu">
        <header className="start-scene__hero">
          <h1 className="start-scene__title-main">低碳工业园</h1>
          <p className="start-scene__title-sub">改造计划</p>
          <p className="start-scene__tagline">一座沉寂多年的工业园，等待新的管理者。</p>
        </header>

        <nav className="start-scene__actions" aria-label="首页菜单">
          <button type="button" className="start-scene__btn start-scene__btn--primary" onClick={onStart}>
            开始游戏
          </button>
          <button
            type="button"
            className="start-scene__btn start-scene__btn--secondary"
            onClick={() => setShowHelp(true)}
          >
            游戏说明
          </button>
          <button type="button" className="start-scene__btn start-scene__btn--disabled" disabled>
            继续游戏（暂未开放）
          </button>
        </nav>
      </main>

      {showHelp && (
        <div
          className="start-scene__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-help-title"
          onClick={() => setShowHelp(false)}
        >
          <div className="start-scene__modal-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="start-scene__modal-close"
              onClick={() => setShowHelp(false)}
              aria-label="关闭"
            >
              ×
            </button>
            <h2 id="start-help-title" className="start-scene__modal-title">
              游戏说明
            </h2>
            <div className="start-scene__modal-body">
              {HELP_LINES.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <button
              type="button"
              className="start-scene__btn start-scene__btn--secondary start-scene__modal-ok"
              onClick={() => setShowHelp(false)}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

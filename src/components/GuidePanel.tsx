import type { GuideState } from '../game/onboarding';
import { gameBridge } from '../game/bridge';

export function GuidePanel({ guide, demoActive }: { guide: GuideState; demoActive: boolean }) {
  if (demoActive || !guide.step) return null;

  return (
    <aside className="guide-panel">
      <div className="guide-panel__progress">
        <div className="guide-panel__fill" style={{ width: `${guide.progress}%` }} />
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.body}</p>
      {guide.cta && <span className="guide-panel__cta">{guide.cta}</span>}
      <div className="guide-panel__actions">
        <button type="button" className="guide-panel__btn" onClick={() => gameBridge.guideNext()}>
          继续
        </button>
        <button type="button" className="guide-panel__btn guide-panel__btn--ghost" onClick={() => gameBridge.guideSkip()}>
          跳过引导
        </button>
      </div>
    </aside>
  );
}

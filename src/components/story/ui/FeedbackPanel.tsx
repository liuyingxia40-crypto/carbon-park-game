import { useState } from 'react';
import './feedback-panel.css';

const FEEDBACK_STORAGE_KEY = 'industrial_park_feedback';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
};

export function FeedbackPanel({ open, onClose, onSubmitted }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const entry = {
        text: trimmed,
        at: new Date().toISOString(),
      };
      const prev = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? '[]') as unknown[];
      const next = Array.isArray(prev) ? [...prev, entry] : [entry];
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
      setText('');
      onSubmitted();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-panel-root" role="dialog" aria-modal="true" aria-labelledby="feedback-panel-title">
      <div className="feedback-panel-root__scrim" aria-hidden onClick={onClose} />
      <div className="feedback-panel">
        <header className="feedback-panel__header">
          <span className="feedback-panel__header-icon" aria-hidden>
            💬
          </span>
          <h2 id="feedback-panel-title" className="feedback-panel__title">
            问题反馈
          </h2>
        </header>

        <p className="feedback-panel__hint">请描述您遇到的问题或改进建议，我们会尽快处理。</p>

        <textarea
          className="feedback-panel__input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="例如：工厂点击无反应、文字显示不全、操作不清楚……"
          rows={5}
          maxLength={500}
        />

        <div className="feedback-panel__meta">{text.length}/500</div>

        <footer className="feedback-panel__footer">
          <button type="button" className="feedback-panel__btn feedback-panel__btn--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="feedback-panel__btn feedback-panel__btn--primary"
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
          >
            提交反馈
          </button>
        </footer>
      </div>
    </div>
  );
}

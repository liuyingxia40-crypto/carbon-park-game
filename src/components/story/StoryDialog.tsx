import type { StoryChoice } from '../../game/story/storyScript';
import './StoryDialog.css';

type Props = {
  text: string;
  choices: StoryChoice[];
  onChoose: (choice: StoryChoice) => void;
};

export function StoryDialog({ text, choices, onChoose }: Props) {
  return (
    <div className="story-dialog-wrap">
      <div className="story-dialog" role="dialog" aria-live="polite">
        <p className="story-dialog__text">{text}</p>
        <div className="story-dialog__choices">
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="story-dialog__btn"
              onClick={() => onChoose(c)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

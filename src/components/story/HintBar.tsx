import './HintBar.css';

type Props = {
  message: string;
};

export function HintBar({ message }: Props) {
  return (
    <footer className="hint-bar" role="status" aria-live="polite">
      <span className="hint-bar__dot" aria-hidden />
      <p className="hint-bar__text">{message}</p>
    </footer>
  );
}

import './game-ui.css';

type Props = {
  show: boolean;
};

export function SuccessRing({ show }: Props) {
  if (!show) return null;
  return (
    <div className="success-ring" aria-hidden>
      <div className="success-ring__circle" />
    </div>
  );
}

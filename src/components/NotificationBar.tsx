type Props = {
  message: string;
};

export function NotificationBar({ message }: Props) {
  if (!message) return null;
  return (
    <div className="shanghai-notice" role="status">
      <span className="shanghai-notice__icon" aria-hidden>
        ▲
      </span>
      <p className="shanghai-notice__text">{message}</p>
    </div>
  );
}

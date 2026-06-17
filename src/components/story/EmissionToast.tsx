import { useEffect, useState } from 'react';
import './EmissionToast.css';

type Props = {
  message: string | null;
  onDone: () => void;
};

export function EmissionToast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 2200);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message || !visible) return null;

  const positive = message.includes('减排') && !message.includes('增加');

  return (
    <div
      className={`emission-toast${positive ? ' emission-toast--cut' : ' emission-toast--rise'}`}
      role="status"
    >
      {message}
    </div>
  );
}

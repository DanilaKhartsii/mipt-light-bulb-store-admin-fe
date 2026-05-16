import { ReactNode, useEffect } from 'react';
import s from './Modal.module.css';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={s.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.panel}>
        <div className={s.head}>
          <span className={s.title}>{title}</span>
          <button className={s.close} onClick={onClose}>×</button>
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );
}
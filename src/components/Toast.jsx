import { useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import '../assets/styles/toast.css';

function ToastItem({ id, type, message, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, 4000);
    return () => clearTimeout(timerRef.current);
  }, [dismiss]);

  const icons = {
    success: <CheckCircle size={18} />,
    error:   <AlertCircle size={18} />,
    info:    <Info size={18} />,
  };

  return (
    <div className={`toast toast--${type} ${exiting ? 'toast--exit' : 'toast--enter'}`}>
      <span className="toast__icon">{icons[type] ?? icons.info}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={dismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container" role="region" aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
}

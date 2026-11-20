import { useState } from 'react';

/** Botón de borrado en dos pasos (sin diálogos del navegador). */
export function ConfirmButton({
  onConfirm,
  label = 'Eliminar',
  confirmLabel = '¿Confirmar?',
  className = 'btn small danger-ghost',
}: {
  onConfirm: () => void | Promise<unknown>;
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className={className} onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="confirm">
      <button
        type="button"
        className="btn small danger"
        onClick={async () => {
          await onConfirm();
          setArmed(false);
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className="btn small" onClick={() => setArmed(false)}>
        No
      </button>
    </span>
  );
}

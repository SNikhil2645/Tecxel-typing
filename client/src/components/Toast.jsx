import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bg =
    type === 'error'
      ? 'var(--color-error)'
      : type === 'success'
      ? 'var(--color-success)'
      : 'var(--color-ink)';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: bg,
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: 'var(--radius-sm)',
        border: '2px solid var(--color-ink)',
        boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: 600,
        fontSize: '0.9rem',
        maxWidth: '400px',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

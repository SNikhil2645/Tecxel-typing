import React, { useEffect, useRef } from 'react';

export default function TypingInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  placeholder = 'Type here when the countdown finishes...',
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && !disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const handleKeyDown = (e) => {
    // Block Ctrl+V or Cmd+V
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
    }
    // Block Ctrl+Insert (paste on Windows)
    if (e.ctrlKey && e.key === 'Insert') {
      e.preventDefault();
    }
    // Block Shift+Insert (paste on Windows/Linux)
    if (e.shiftKey && e.key === 'Insert') {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <textarea
      ref={textareaRef}
      className="typing-input-area"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onContextMenu={handleContextMenu}
      disabled={disabled}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  );
}

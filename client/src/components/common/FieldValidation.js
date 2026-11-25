import React from 'react';

const FieldValidation = ({ id, message, isValid }) => {
  if (!message) return null;

  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      className={`mt-1 text-[11px] font-medium ${
        isValid ? 'text-emerald-600' : 'text-rose-600'
      }`}
    >
      {message}
    </p>
  );
};

export default FieldValidation;

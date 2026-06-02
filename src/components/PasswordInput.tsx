import { useState } from "react";
import Eye from "@/assets/eye.svg";
import "@/styles/reg.css";
import type { PasswordInputProps } from '@/types';

const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLImageElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
  };

  const errorId = error ? `${label}-error` : undefined;

  return (
    <div className="reg_window_form__field reg_window_form__field--password">
      <p className="text-info__reg_window">{label}</p>
      <input
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={errorId}
      />
      <img
        className="reg_window_passwordLogo"
        src={Eye}
        alt="toggle password visibility"
        onClick={() => setIsVisible(!isVisible)}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      />
      {error && (
        <span id={errorId} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;


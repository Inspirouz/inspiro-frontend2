import { useState, useRef, useEffect } from 'react';
import MainLogo from '@/assets/MainLogo.svg';
import '@/styles/email-confirmation.css';

interface EmailConfirmationProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
}

const EmailConfirmation = ({ email, onConfirm, onResend }: EmailConfirmationProps) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{1,6}$/.test(pastedData)) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedData[i] || '';
      }
      setCode(newCode);
      // Focus the next empty input or the last one
      const nextEmptyIndex = newCode.findIndex((digit) => !digit);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const codeString = codeToSubmit || code.join('');
    if (codeString.length === 6) {
      setError(false);
      try {
        await onConfirm(codeString);
      } catch (err) {
        // If confirmation fails, show error state
        setError(true);
        // Clear inputs and focus first one
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      onResend();
    }
  };

  return (
    <div className="email-confirmation">
      <img src={MainLogo} alt="MainLogo" className="email-confirmation__logo" />
      <h2 className="email-confirmation__title">Подтвердите email</h2>
      <p className="email-confirmation__description">
        Код был отправлен на Ваш email
      </p>

      <div className="email-confirmation__code-inputs">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              setError(false);
              handleChange(index, e.target.value);
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`code-input ${error ? 'error' : ''}`}
            placeholder="-"
            aria-label={`Code digit ${index + 1}`}
            aria-invalid={error}
          />
        ))}
      </div>
      {error && (
        <p className="email-confirmation__error" role="alert">
          Неверный код. Попробуйте снова.
        </p>
      )}

      <div className="email-confirmation__resend">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="resend-button"
        >
          <span className="resend-icon">↻</span>
          {canResend ? (
            'Отправить код повторно'
          ) : (
            `Отправить код повторно через ${formatTime(timer)}`
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={code.some((digit) => !digit)}
        className="confirm-button"
      >
        Подтвердить
      </button>
    </div>
  );
};

export default EmailConfirmation;


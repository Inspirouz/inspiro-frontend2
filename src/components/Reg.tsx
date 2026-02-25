import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import MainLogo from "@/assets/MainLogo.svg";
import Google from "@/assets/google.svg";
import PasswordInput from "@/components/PasswordInput";
import Modal from "@/components/Modal";
import EmailConfirmation from "@/components/EmailConfirmation";
import CreatePassword from "@/components/CreatePassword";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/utils/auth";
import type { FormData, FormErrors } from '@/types';
import "@/styles/reg.css";

type AuthMode = 'register' | 'login';

interface RegProps {
  onClose?: () => void;
}

const Reg = ({ onClose }: RegProps) => {
  const { toast, showSuccess, hideToast, showError } = useToast();
  const { setAuthData } = useAuth();
  const [mode, setMode] = useState<AuthMode>('register');
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'register' && !formData.full_name?.trim()) {
      newErrors.full_name = 'Имя обязателен';
    }

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email неверный';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || data?.error || `Ошибка ${res.status}`);
        }
        if (data.token && data.user) {
          setAuthData(data.token, data.user);
          onClose?.();
          showSuccess('Успех!', 'Аккаунт успешно создан!');
        } else {
          setShowEmailConfirmation(true);
        }
      } else {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || data?.error || `Ошибка ${res.status}`);
        }
        if (data.token && data.user) {
          setAuthData(data.token, data.user);
          onClose?.();
          showSuccess('Успех!', 'Вы успешно вошли в систему');
        } else {
          throw new Error(data?.message || 'Неверный ответ сервера');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
      setErrors({ 
        submit: mode === 'register' 
          ? errorMessage
          : errorMessage
      });
      showError('Ошибка', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailConfirm = async (code: string): Promise<void> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const res = await fetch(`${apiUrl}/sign-up/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        otp: code,
      }),
    });
    const json = await res.json().catch(() => ({}));
    const statusCode = json?.status_code ?? res.status;
    const data = json?.data ?? json;

    if (!res.ok || (statusCode !== 200 && statusCode !== 201)) {
      throw new Error(json?.message || json?.error || data?.message || `Ошибка ${res.status}`);
    }

    setShowEmailConfirmation(false);

    if (data?.access_token) {
      const user = {
        id: String(data.id ?? ''),
        email: data.email ?? formData.email,
        name: data.full_name ?? data.email?.split('@')[0],
      };
      setAuthData(data.access_token, user, {
        refreshToken: data.refresh_token ?? undefined,
        fullData: data,
      });
      onClose?.();
      showSuccess('Успех!', json?.message || 'Вы успешно зарегистрировались!');
    } else if (mode === 'register') {
      onClose?.();
      showSuccess('Успех!', 'Вы успешно зарегистрировались!');
    } else {
      showSuccess('Успех!', json?.message || 'Email успешно подтвержден');
    }
  };

  const handlePasswordComplete = async (password: string) => {
    try {
      // Call auth service to create password
      await authService.createPassword(password);
      // Complete registration with auth service
      const response = await authService.register(formData.email, password);
      // Save auth data to context and local storage
      setAuthData(response.token, response.user);
      // Close modal and show success
      setShowCreatePassword(false);
      onClose?.();
      showSuccess('Успех!', 'Аккаунт успешно создан!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании пароля';
      showError('Ошибка', errorMessage);
    }
  };

  const handleResendCode = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${apiUrl}/sign-up/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data?.message ?? data?.error) || `Ошибка ${res.status}`);
      }
      showSuccess('Успех!', 'Код был успешно отправлен');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при отправке кода';
      showError('Ошибка', errorMessage);
    }
  };

  const handleGoogleLogin = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // TODO: Add Google OAuth logic
  };

  return (
    <div className="reg_window">
      <img src={MainLogo} alt="MainLogo" className="reg_window__logo" />
      <h2 className="reg_window__title">Добро пожаловать!</h2>
      
      <div className="reg_window__links">
        <button
          type="button"
          className={`reg_window__tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => {
            setMode('register');
            setErrors({});
            setFormData({ full_name: '', email: '', password: '', confirmPassword: '' });
          }}
        >
          Создать аккаунт
        </button>
        <button
          type="button"
          className={`reg_window__tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => {
            setMode('login');
            setErrors({});
            setFormData({ full_name: '', email: '', password: '', confirmPassword: '' });
          }}
        >
          Войти
        </button>
      </div>

      <form className="reg_window_form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="reg_window_form__field">
            <p className="text-info__reg_window">Имя</p>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required={mode === 'register'}
              aria-label="Имя"
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <span className="error-message" role="alert">{errors.full_name}</span>
            )}
          </div>
        )}
        <div className="reg_window_form__field">
          <p className="text-info__reg_window">Email</p>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            aria-label="Email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-message" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <PasswordInput
          label="Пароль"
          placeholder="Введите пароль"
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
          required
          error={errors.password}
        />

        {mode === 'register' && (
          <PasswordInput
            label="Повторите пароль"
            placeholder="Введите пароль повторно"
            value={formData.confirmPassword}
            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            required
            error={errors.confirmPassword}
          />
        )}

        {mode === 'login' && (
          <div className="reg_window__forgot-password">
            <Link to="/forgot-password">Забыли пароль?</Link>
          </div>
        )}

        {errors.submit && (
          <div className="error-message" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="reg_window_form__submit">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (mode === 'register' ? 'Регистрация...' : 'Вход...')
              : (mode === 'register' ? 'Зарегестрироваться' : 'Войти')
            }
          </button>
          <button type="button" onClick={handleGoogleLogin} disabled={isSubmitting} className="google-button">
            <img src={Google} alt="Google" />
            Войти через Google
          </button>
        </div>
      </form>
      
      <p className="reg_window__additional_agreements">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <Link to="/privacy">Политикой конфиденциальности</Link> и{" "}
        <Link to="/terms">Условиями использования</Link>
      </p>

      {/* Email Confirmation Modal */}
      <Modal active={showEmailConfirmation} setActive={setShowEmailConfirmation}>
        <EmailConfirmation
          email={formData.email}
          onConfirm={handleEmailConfirm}
          onResend={handleResendCode}
        />
      </Modal>

      {/* Create Password Modal */}
      <Modal active={showCreatePassword} setActive={setShowCreatePassword}>
        <CreatePassword onComplete={handlePasswordComplete} />
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        description={toast.description}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  );
};

export default Reg;


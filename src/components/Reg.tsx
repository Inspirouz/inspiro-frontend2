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
        // Call auth service for registration
        await authService.register(formData.email, formData.password);
        // Show email confirmation modal
        setShowEmailConfirmation(true);
      } else {
        // Call auth service for login
        const response = await authService.login(formData.email, formData.password);
        // Save auth data to context and local storage
        setAuthData(response.token, response.user);
        // Close modal and show success
        onClose?.();
        showSuccess('Успех!', 'Вы успешно вошли в систему');
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
    try {
      // Call auth service to confirm email
      await authService.confirmEmail(code);
      setShowEmailConfirmation(false);
      // If user is in register mode, show create password modal
      if (mode === 'register') {
        setShowCreatePassword(true);
      } else {
        // For login mode, show success toast
        showSuccess('Успех!', 'Email успешно подтвержден');
      }
    } catch (error) {
      throw error; // Re-throw to let EmailConfirmation component handle it
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
    try {
      // Call auth service to resend code
      await authService.resendCode(formData.email);
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
            setFormData({ email: '', password: '', confirmPassword: '' });
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
            setFormData({ email: '', password: '', confirmPassword: '' });
          }}
        >
          Войти
        </button>
      </div>

      <form className="reg_window_form" onSubmit={handleSubmit}>
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


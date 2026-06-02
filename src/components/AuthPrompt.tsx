import { useAuth } from '@/contexts/AuthContext';
import '@/styles/auth-prompt.css';
import MainLogo from '@/assets/MainLogo.svg';

const AuthPrompt = () => {
  const { isAuthorized } = useAuth();

  // Don't show if user is authorized
  if (isAuthorized) {
    return null;
  }

  const handleLoginClick = () => {
    // Dispatch custom event to open login modal
    window.dispatchEvent(new CustomEvent('openLoginModal'));
  };

  return (
    <>
      {/* Overlay blur effect */}
      <div className="auth-prompt-overlay" />
      
      {/* Fixed bottom banner */}
      <div className="auth-prompt">
        <div className="auth-prompt__content">
          <div className="auth-prompt__logo">
            <img src={MainLogo} alt="Inspiro" />
          </div>
          <h2 className="auth-prompt__title">Хотите смотреть дальше?</h2>
          <p className="auth-prompt__subtitle">
            Войдите или создайте аккаунт, чтобы продолжить
          </p>
          <button className="auth-prompt__button" onClick={handleLoginClick}>
            Авторизироваться
          </button>
        </div>
      </div>
    </>
  );
};

export default AuthPrompt;


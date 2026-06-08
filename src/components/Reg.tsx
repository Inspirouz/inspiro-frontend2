import { useState } from "react";
import { Link } from "react-router-dom";
import MainLogo from "@/assets/MainLogo.svg";
import Google from "@/assets/google.svg";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/reg.css";

interface RegProps {
  onClose?: () => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const API_URL = import.meta.env.VITE_API_URL as string;

const Reg = ({ onClose }: RegProps) => {
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    if (!window.google) {
      setError('Google SDK не загружен. Обновите страницу.');
      return;
    }

    setError('');
    setLoading(true);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          setLoading(false);
          setError('Вход через Google отменён.');
          return;
        }

        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: response.access_token }),
          });

          const json = await res.json().catch(() => ({}));
          const data = json?.data ?? json;

          if (!res.ok || (json.status_code && json.status_code !== 200)) {
            throw new Error(json?.message || 'Ошибка авторизации');
          }

          if (!data?.access_token) {
            throw new Error('Сервер не вернул токен');
          }

          setAuthData(data.access_token, {
            id: String(data.id ?? ''),
            email: data.email ?? '',
            name: data.full_name ?? data.email?.split('@')[0] ?? '',
          }, { refreshToken: data.refresh_token });

          onClose?.();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
          setLoading(false);
        }
      },
    });

    client.requestAccessToken();
  };

  return (
    <div className="reg_window">
      <img src={MainLogo} alt="Inspiro" className="reg_window__logo" />
      <h2 className="reg_window__title">Добро пожаловать</h2>

      <button
        type="button"
        className="reg_window__google-btn"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <span className="reg_window__spinner" />
        ) : (
          <img src={Google} alt="Google" className="reg_window__google-icon" />
        )}
        {loading ? 'Входим...' : 'Войти через Google'}
      </button>

      {error && <p className="reg_window__error">{error}</p>}

      <p className="reg_window__additional_agreements">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <Link to="/privacy">Политикой конфиденциальности</Link> и{" "}
        <Link to="/terms">Условиями использования</Link>
      </p>
    </div>
  );
};

export default Reg;

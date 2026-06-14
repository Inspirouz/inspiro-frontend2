import PaywallLogo from '@/assets/PaywallLogo.png';
import '@/styles/paywall.css';

const PaywallGate = () => {
  const openLogin = () => window.dispatchEvent(new Event('openLoginModal'));

  return (
    <div className="paywall-cta">
      <div className="paywall-cta__logo-wrap">
        <img src={PaywallLogo} alt="Inspiro" className="paywall-cta__logo" />
      </div>
      <div className="paywall-cta__text">
        <h2 className="paywall-cta__title">Хотите смотреть дальше?</h2>
        <p className="paywall-cta__subtitle">Войдите или создайте аккаунт, чтобы продолжить</p>
      </div>
      <button className="paywall-cta__btn" onClick={openLogin}>
        Авторизоваться
      </button>
    </div>
  );
};

export default PaywallGate;

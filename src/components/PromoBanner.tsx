import '@/styles/promo-banner.css';

const PromoBanner = () => {
  return (
    <div className="promo-banner">
      <div className="promo-banner__content">
        <h3 className="promo-banner__title">
          Сообщи о проблеме и получи подписку на месяц!
        </h3>
        <p className="promo-banner__subtitle">
          Помоги проекту расти
        </p>
      </div>
      <div className="promo-banner__pattern" aria-hidden="true" />
    </div>
  );
};

export default PromoBanner;

import { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import '@/styles/subscription.css';

type TimePeriod = 'month' | '3months' | 'year';

interface PlanFeature {
  text: string;
  icon?: string;
}

interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  discount?: number;
}

const SubscriptionPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

  useSEO({
    title: 'Подписка - Inspiro',
    description: 'Выберите подходящий план подписки для доступа к UI/UX паттернам и дизайн элементам',
    keywords: 'подписка, subscription, pricing, plans',
  });

  const pricing = {
    basic: {
      month: { price: 0, oneTime: 0 },
      '3months': { price: 0, oneTime: 0 },
      year: { price: 0, oneTime: 0 },
    },
    pro: {
      month: { price: 20000, oneTime: 20000 },
      '3months': { price: 17000, oneTime: 51000, discount: 15 },
      year: { price: 16000, oneTime: 192000, discount: 20 },
    },
    team: {
      month: { price: 80000, oneTime: 80000 },
      '3months': { price: 68000, oneTime: 204000, discount: 15 },
      year: { price: 64000, oneTime: 768000, discount: 20 },
    },
  };

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Для тех, кто просто хочет вдохновения',
      features: [
        { text: 'Доступ ко всем приложениям и паттернам' },
        { text: 'Базовый поиск по приложениям и паттернам' },
        { text: 'Просмотр экранов и UI-элементов' },
      ],
    },
    {
      id: 'pro',
      title: 'Pro',
      description: 'Для тех, кто просто хочет вдохновения',
      isPopular: true,
      features: [
        { text: 'Умный поиск по тегам, категориям и визуальным элементам', icon: 'search' },
        { text: 'Быстрое скачивание изображений и видео', icon: 'download' },
        { text: 'Доступ к видео и анимациям интерфейсов', icon: 'video' },
        { text: 'Вкладка "Избранное" — создавай личные библиотеки проектов', icon: 'favorite' },
        { text: 'Ранний доступ к новым материалам и обновлениям', icon: 'early' },
      ],
    },
    {
      id: 'team',
      title: 'Team',
      description: 'Для студий и продуктовых команд',
      features: [
        { text: 'Включает всё из Pro' },
        { text: 'Общие коллекции и рабочие библиотеки' },
        { text: 'Единый платеж' },
      ],
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getCurrentPrice = (planId: string) => {
    const plan = pricing[planId as keyof typeof pricing];
    return plan[selectedPeriod];
  };

  const handleSubscribe = (planId: string) => {
    console.log('Subscribe to:', planId, 'Period:', selectedPeriod);
    // TODO: Implement subscription logic
  };

  return (
    <div className="subscription-page">
      <h1 className="subscription-title">Подписка</h1>

      {/* Time Period Tabs */}
      <div className="period-tabs">
        <button
          className={`period-tab ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('month')}
        >
          <span className="period-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.4" d="M27.066 3.33325H12.9327C8.33268 3.33325 6.66602 4.99992 6.66602 9.68325V30.3166C6.66602 34.9999 8.33268 36.6666 12.9327 36.6666H27.0493C31.666 36.6666 33.3327 34.9999 33.3327 30.3166V9.68325C33.3327 4.99992 31.666 3.33325 27.066 3.33325Z" fill="url(#paint0_linear_month)"/>
              <path d="M23.3327 10.4167H16.666C15.9827 10.4167 15.416 9.85008 15.416 9.16675C15.416 8.48341 15.9827 7.91675 16.666 7.91675H23.3327C24.016 7.91675 24.5827 8.48341 24.5827 9.16675C24.5827 9.85008 24.016 10.4167 23.3327 10.4167Z" fill="url(#paint1_linear_month)"/>
              <path d="M20.0007 32.1668C21.6115 32.1668 22.9173 30.861 22.9173 29.2502C22.9173 27.6393 21.6115 26.3335 20.0007 26.3335C18.3898 26.3335 17.084 27.6393 17.084 29.2502C17.084 30.861 18.3898 32.1668 20.0007 32.1668Z" fill="url(#paint2_linear_month)"/>
              <defs>
                <linearGradient id="paint0_linear_month" x1="19.9993" y1="3.33325" x2="19.9993" y2="36.6666" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="paint1_linear_month" x1="19.9993" y1="7.50008" x2="19.9993" y2="10.8334" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="paint2_linear_month" x1="20.0007" y1="26.3335" x2="20.0007" y2="32.1668" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          Месяц
        </button>
        <button
          className={`period-tab ${selectedPeriod === '3months' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('3months')}
        >
          <span className="period-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.4" d="M27.066 3.33325H12.9327C8.33268 3.33325 6.66602 4.99992 6.66602 9.68325V30.3166C6.66602 34.9999 8.33268 36.6666 12.9327 36.6666H27.0493C31.666 36.6666 33.3327 34.9999 33.3327 30.3166V9.68325C33.3327 4.99992 31.666 3.33325 27.066 3.33325Z" fill="url(#paint0_linear_3months)"/>
              <path d="M23.3327 10.4167H16.666C15.9827 10.4167 15.416 9.85008 15.416 9.16675C15.416 8.48341 15.9827 7.91675 16.666 7.91675H23.3327C24.016 7.91675 24.5827 8.48341 24.5827 9.16675C24.5827 9.85008 24.016 10.4167 23.3327 10.4167Z" fill="url(#paint1_linear_3months)"/>
              <path d="M20.0007 32.1668C21.6115 32.1668 22.9173 30.861 22.9173 29.2502C22.9173 27.6393 21.6115 26.3335 20.0007 26.3335C18.3898 26.3335 17.084 27.6393 17.084 29.2502C17.084 30.861 18.3898 32.1668 20.0007 32.1668Z" fill="url(#paint2_linear_3months)"/>
              <defs>
                <linearGradient id="paint0_linear_3months" x1="19.9993" y1="3.33325" x2="19.9993" y2="36.6666" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="paint1_linear_3months" x1="19.9993" y1="7.50008" x2="19.9993" y2="10.8334" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="paint2_linear_3months" x1="20.0007" y1="26.3335" x2="20.0007" y2="32.1668" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          3 месяца
        </button>
        <button
          className={`period-tab ${selectedPeriod === 'year' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('year')}
        >
          <span className="period-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.4" d="M27.066 3.33325H12.9327C8.33268 3.33325 6.66602 4.99992 6.66602 9.68325V30.3166C6.66602 34.9999 8.33268 36.6666 12.9327 36.6666H27.0493C31.666 36.6666 33.3327 34.9999 33.3327 30.3166V9.68325C33.3327 4.99992 31.666 3.33325 27.066 3.33325Z" fill="url(#paint0_linear_year)"/>
              <path d="M23.3327 10.4167H16.666C15.9827 10.4167 15.416 9.85008 15.416 9.16675C15.416 8.48341 15.9827 7.91675 16.666 7.91675H23.3327C24.016 7.91675 24.5827 8.48341 24.5827 9.16675C24.5827 9.85008 24.016 10.4167 23.3327 10.4167Z" fill="url(#paint1_linear_year)"/>
              <path d="M20.0007 32.1668C21.6115 32.1668 22.9173 30.861 22.9173 29.2502C22.9173 27.6393 21.6115 26.3335 20.0007 26.3335C18.3898 26.3335 17.084 27.6393 17.084 29.2502C17.084 30.861 18.3898 32.1668 20.0007 32.1668Z" fill="url(#paint2_linear_year)"/>
              <defs>
                <linearGradient id="paint0_linear_year" x1="19.9993" y1="3.33325" x2="19.9993" y2="36.6666" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="paint1_linear_year" x1="19.9993" y1="7.50008" x2="19.9993" y2="10.8334" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="paint2_linear_year" x1="20.0007" y1="26.3335" x2="20.0007" y2="32.1668" gradientUnits="userSpaceOnUse">
                  <stop stopColor="currentColor"/>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          Год
        </button>
      </div>

      {/* Subscription Plans */}
      <div className="subscription-plans">
        {plans.map((plan) => {
          const currentPrice = getCurrentPrice(plan.id);
          const isBasic = plan.id === 'basic';
          const discount = 'discount' in currentPrice ? currentPrice.discount : undefined;

          return (
            <div
              key={plan.id}
              className={`subscription-card ${plan.isPopular ? 'popular' : ''}`}
            >
              {plan.isPopular && (
                <div className="popular-badge">Популярный</div>
              )}

              <div className="card-header">
                <h2 className="card-title">
                  {plan.title}
                  {discount && (
                    <span className="discount-badge">-{discount}%</span>
                  )}
                </h2>
                <p className="card-description">{plan.description}</p>
              </div>

              <div className="card-pricing">
                {isBasic ? (
                  <>
                    <div className="price-amount">0 сум</div>
                    <div className="price-status">Бесплатно</div>
                  </>
                ) : (
                  <>
                    <div className="price-amount">
                      {formatPrice(currentPrice.price)} сум / месяц
                    </div>
                    <div className="price-note">
                      Единовременная оплата {formatPrice(currentPrice.oneTime)} сум
                    </div>
                  </>
                )}
              </div>

              <button
                className={`subscribe-button ${isBasic ? 'current-plan' : ''}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isBasic}
              >
                {isBasic ? 'Текущий план' : 'Оформить подписку'}
              </button>

              <ul className="card-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">
                      {feature.icon === 'search' && '🔍'}
                      {feature.icon === 'download' && '⚡'}
                      {feature.icon === 'video' && '📹'}
                      {feature.icon === 'favorite' && '⭐'}
                      {feature.icon === 'early' && '⏰'}
                      {!feature.icon && (plan.id === 'team' ? '+' : '✓')}
                    </span>
                    <span className="feature-text">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPage;



import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLogo from '@/assets/MainLogo.svg';
import '@/styles/profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page
    console.log('Navigate to settings');
  };

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__avatar">
          <img src={MainLogo} alt="Avatar" className="profile__avatar-img" />
        </div>
        <div className="profile__info">
          <p className="profile__label">Email</p>
          <p className="profile__email">{user?.email || 'No email'}</p>
        </div>
      </div>

      <div className="profile__divider"></div>

      <div className="profile__menu">
        <button
          className="profile__menu-item"
          onClick={handleSettings}
        >
          <div className="profile__menu-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.25 10C16.25 10.4133 16.1667 10.8 16.025 11.15L15.8333 11.5833L13.3333 13.3333L12.0833 14.1667L10.8333 15.8333C10.4833 16.1667 10.0833 16.25 10 16.25C9.91667 16.25 9.51667 16.1667 9.16667 15.8333L7.91667 14.1667L6.66667 13.3333L4.16667 11.5833L3.975 11.15C3.83333 10.8 3.75 10.4133 3.75 10C3.75 9.58667 3.83333 9.2 3.975 8.85L4.16667 8.41667L6.66667 6.66667L7.91667 5.83333L9.16667 4.16667C9.51667 3.83333 9.91667 3.75 10 3.75C10.0833 3.75 10.4833 3.83333 10.8333 4.16667L12.0833 5.83333L13.3333 6.66667L15.8333 8.41667L16.025 8.85C16.1667 9.2 16.25 9.58667 16.25 10Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="profile__menu-text">Настройки</span>
          <div className="profile__menu-chevron">›</div>
        </button>

        <button
          className="profile__menu-item profile__menu-item--logout"
          onClick={handleLogout}
        >
          <div className="profile__menu-icon profile__menu-icon--logout">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.3333 14.1667L17.5 10L13.3333 5.83333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 10H7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="profile__menu-text">Выйти из аккаунта</span>
          <div className="profile__menu-chevron">›</div>
        </button>
      </div>
    </div>
  );
};

export default Profile;










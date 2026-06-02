import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLogo from '@/assets/MainLogo.svg';
import logoutIcon from '@/assets/logout-icon.svg';
import chevronRight from '@/assets/chevron-right.svg';
import '@/styles/profile-dropdown.css';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const ProfileDropdown = ({ isOpen, onClose, buttonRef }: ProfileDropdownProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return;
  }, [isOpen, onClose, buttonRef]);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      dropdown.style.top = `${buttonRect.bottom + 8}px`;
      dropdown.style.right = `${window.innerWidth - buttonRect.right}px`;
    }
  }, [isOpen, buttonRef]);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      {/* User info */}
      <div className="profile-dropdown__header">
        <div className="profile-dropdown__avatar">
          <img src={MainLogo} alt="Avatar" className="profile-dropdown__avatar-img" />
        </div>
        <div className="profile-dropdown__info">
          <p className="profile-dropdown__label">Email</p>
          <p className="profile-dropdown__email">{user?.email || '—'}</p>
        </div>
      </div>

      {/* Logout */}
      <button className="profile-dropdown__logout" onClick={handleLogout}>
        <div className="profile-dropdown__logout-left">
          <img src={logoutIcon} alt="" className="profile-dropdown__logout-icon" aria-hidden="true" />
          <span className="profile-dropdown__logout-text">Выйти из аккаунта</span>
        </div>
        <img src={chevronRight} alt="" className="profile-dropdown__chevron" aria-hidden="true" />
      </button>
    </div>
  );
};

export default ProfileDropdown;

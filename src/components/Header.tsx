import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLogo from "@/assets/MainLogo.svg";
import langIcon from "@/assets/langIcon.svg";
import logIcon from "@/assets/logIcon.svg";
import Modal from "@/components/Modal";
import Reg from "@/components/Reg";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchModal from "@/components/SearchModal";
import { useAuth } from "@/contexts/AuthContext";
// CSS fayllar index.css orqali import qilinadi

const Header = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleSubscribeClick = () => {
    if (isAuthorized) {
      navigate('/subscription');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLanguageClick = () => {
    // TODO: Add language switching logic
  };

  return (
    <>
      <header className="header-search">
        <img 
          className="MainLogo" 
          src={MainLogo} 
          alt="Inspiro Logo" 
          loading="eager"
          fetchPriority="high"
          width="64"
          height="64"
        />
        <button className="header-input" onClick={handleSearchClick}>
          Поиск...
        </button>
        <div className="Header-block">
          <button className="sub_button" onClick={handleSubscribeClick}>
            Оформить подписку
          </button>
          <button
            className="Header-btn"
            onClick={handleLanguageClick}
            aria-label="Change language"
          >
            <img className="block-LangLog" src={langIcon} alt="" aria-hidden="true" />
          </button>
          {isAuthorized ? (
            <>
              <button
                ref={profileButtonRef}
                className="Header-btn profile-btn"
                onClick={handleProfileClick}
                aria-label="Profile"
              >
                <img className="block-LangLog" src={logIcon} alt="" aria-hidden="true" />
              </button>
              <ProfileDropdown
                isOpen={isProfileDropdownOpen}
                onClose={() => setIsProfileDropdownOpen(false)}
                buttonRef={profileButtonRef}
              />
            </>
          ) : (
            <button
              className="Header-btn"
              onClick={handleLoginClick}
              aria-label="Login"
            >
              <img className="block-LangLog" src={logIcon} alt="" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <Modal active={isLoginModalOpen} setActive={setIsLoginModalOpen}>
        <Reg onClose={() => setIsLoginModalOpen(false)} />
      </Modal>


      <Modal active={isSearchModalOpen} setActive={setIsSearchModalOpen}>
        <SearchModal />
      </Modal>
    </>
  );
};

export default Header;


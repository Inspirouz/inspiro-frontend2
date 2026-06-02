import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLogo from "@/assets/MainLogo.svg";
import logIcon from "@/assets/logIcon.svg";
import emailIcon from "@/assets/email.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import Modal from "@/components/Modal";
import Reg from "@/components/Reg";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchModal from "@/components/SearchModal";
import { useAuth } from "@/contexts/AuthContext";

const CONTACTS = [
  { label: "Email", href: "mailto:sashasashatsoy@gmail.com", icon: emailIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aleksandr-tsoy-82b061276/", icon: linkedinIcon },
];

const Header = () => {
  const { isAuthorized } = useAuth();
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isContactOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setIsContactOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isContactOpen]);

  useEffect(() => {
    const handleOpenLoginModal = () => setIsLoginModalOpen(true);
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => window.removeEventListener('openLoginModal', handleOpenLoginModal);
  }, []);

  const handleSearchClick = () => {
    if (window.innerWidth <= 768) {
      navigate('/search');
    } else {
      setIsSearchModalOpen(true);
    }
  };

  return (
    <>
      <header className="header-search">
        <Link to="/" aria-label="Go to home page">
          <img
            className="MainLogo"
            src={MainLogo}
            alt="Inspiro Logo"
            loading="eager"
            fetchPriority="high"
            width="64"
            height="64"
          />
        </Link>

        <button className="header-input" onClick={handleSearchClick}>
          Поиск...
        </button>

        <div className="Header-block">
          <div className="contact-btn-wrapper" ref={contactRef}>
            <button
              className="contact-btn"
              onClick={() => setIsContactOpen((v) => !v)}
              aria-label="Связаться"
            >
              Связаться
            </button>
            {isContactOpen && (
              <div className="contact-dropdown">
                {CONTACTS.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-dropdown__item"
                    onClick={() => setIsContactOpen(false)}
                  >
                    <img src={c.icon} alt={c.label} className="contact-dropdown__icon" />
                    {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {isAuthorized ? (
            <>
              <button
                ref={profileButtonRef}
                className="Header-btn profile-btn"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
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
              onClick={() => setIsLoginModalOpen(true)}
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
        <SearchModal onClose={() => setIsSearchModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Header;

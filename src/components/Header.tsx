import { useState, useRef, useEffect } from "react";
import { Typewriter } from "@/components/Typewriter";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import MainLogo from "@/assets/MainLogo.svg";
import logIcon from "@/assets/logIcon.svg";
import emailIcon from "@/assets/email.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import Modal from "@/components/Modal";
import Reg from "@/components/Reg";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchModal from "@/components/SearchModal";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS } from "@/constants";
import { NavIcons } from "@/components/icons";
import { useNavCounts } from "@/hooks/useNavCounts";

function fmt(n: number | null): string | null {
  if (!n) return null;
  return n.toLocaleString('ru');
}

const CONTACTS = [
  { label: "Email", href: "mailto:inspirouz@gmail.com", icon: emailIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aleksandr-tsoy-82b061276/", icon: linkedinIcon },
];

const Header = () => {
  const { isAuthorized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailPage = /^\/detail\//.test(location.pathname);
  const isSubscriptionPage = location.pathname === '/subscription';
  const showNav = !isSubscriptionPage && !isDetailPage;
  const counts = useNavCounts();
  const countMap: Record<string, string | null> = {
    '/': fmt(counts.apps),
    '/patterns': fmt(counts.patterns),
    '/scenarios': fmt(counts.scenarios),
    '/ui_elements': fmt(counts.uiElements),
  };
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  const handleSearchClick = () => {
    if (window.innerWidth <= 768) {
      navigate('/search');
    } else {
      setIsSearchModalOpen(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth > 768) {
          setIsSearchModalOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className={`header-search${isDetailPage ? ' header-search--detail' : ''}`}>
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

        {/* Back button — only on detail pages, mobile only */}
        {isDetailPage && (
          <button
            className="mobile-back-btn"
            onClick={() => navigate('/')}
            aria-label="На главную"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="header-center">
          <div className="header-top-row">
            <button className="header-input" onClick={handleSearchClick}>
              <svg className="header-input__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="header-input__placeholder">
                Поиск&nbsp;<Typewriter
                  text={["приложений", "сценариев", "паттернов", "UI элементов"]}
                  speed={80}
                  deleteSpeed={40}
                  delay={1800}
                  loop
                  cursor="|"
                  className="header-input__typewriter"
                />
              </span>
              <span className="header-input__shortcut">
                {isMac ? '⌘' : 'Ctrl'} + K
              </span>
            </button>

            {/* Hamburger — visible only on mobile via CSS, sits next to search */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Открыть меню"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <rect width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="6" width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {showNav && (
            <ul className="header-nav">
              {NAV_ITEMS.map((item) => {
                const chip = countMap[item.path];
                return (
                  <li key={item.path} className="nav-item">
                    <NavLink
                      className={({ isActive }) => `nav_links ${isActive ? 'active' : ''}`}
                      to={item.path}
                      end={item.path === '/'}
                      aria-label={`Navigate to ${item.label}`}
                    >
                      {item.icon && NavIcons[item.icon] && (
                        <span className="nav-icon">{NavIcons[item.icon]}</span>
                      )}
                      <span className="nav-label">{item.label}</span>
                      {chip && <span className="nav-chip">{chip}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

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

      {/* Mobile side menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-menu-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <img className="mobile-menu-logo" src={MainLogo} alt="Inspiro" />

            <div className="mobile-menu-contacts">
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-dropdown__item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img src={c.icon} alt={c.label} className="contact-dropdown__icon" />
                  {c.label}
                </a>
              ))}
            </div>

            {isAuthorized ? (
              <button
                className="mobile-menu-auth-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileDropdownOpen(true);
                }}
              >
                <img src={logIcon} alt="" style={{ width: 20, height: 20 }} />
                Профиль
              </button>
            ) : (
              <button
                className="mobile-menu-auth-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
              >
                Войти
              </button>
            )}
          </div>
        </div>
      )}

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

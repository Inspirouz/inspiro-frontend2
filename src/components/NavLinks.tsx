import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants';
// CSS fayllar index.css orqali import qilinadi

const NavLinks = () => {
  return (
    <nav className="main-nav" role="navigation" aria-label="Main navigation">
      <ul className="link-ul">
        {NAV_ITEMS.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink 
              className="nav_links" 
              to={item.path}
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;

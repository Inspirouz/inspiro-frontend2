import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants';
import { NavIcons } from '@/components/icons';
// CSS fayllar index.css orqali import qilinadi

const NavLinks = () => {
  return (
    <nav className="main-nav" role="navigation" aria-label="Main navigation">
      <ul className="link-ul">
        {NAV_ITEMS.map((item) => (
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
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;

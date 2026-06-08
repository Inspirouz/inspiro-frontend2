import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants';
import { NavIcons } from '@/components/icons';
import { useNavCounts } from '@/hooks/useNavCounts';

function fmt(n: number | null): string | null {
  if (!n) return null;
  return n.toLocaleString('ru');
}

const NavLinks = () => {
  const counts = useNavCounts();

  const countMap: Record<string, string | null> = {
    '/': fmt(counts.apps),
    '/patterns': fmt(counts.patterns),
    '/scenarios': fmt(counts.scenarios),
    '/ui_elements': fmt(counts.uiElements),
  };

  return (
    <nav className="main-nav" role="navigation" aria-label="Main navigation">
      <ul className="link-ul">
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
                {chip && <span className="nav-chip"><span>{chip}</span></span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavLinks;

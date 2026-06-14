import { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    // Safari + React 18 fix: remove hidden attribute React may set during concurrent rendering
    const fix = () => {
      document.querySelectorAll('[hidden]').forEach((el) => {
        el.removeAttribute('hidden');
      });
    };
    fix();
    const t = setTimeout(fix, 100);
    return () => clearTimeout(t);
  }, [location.pathname]);
  const isSearchPage = location.pathname === '/search';
  const isDetailPage = /^\/detail\//.test(location.pathname);

  if (isSearchPage) {
    return <Outlet />;
  }

  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms';

  return (
    <>
      {!isLegalPage && <Header />}
      {!isLegalPage && <div className={`header-spacer${isDetailPage ? ' header-spacer--detail' : ''}`} />}
      <Outlet />
      {!isLegalPage && <ScrollToTopButton />}
      <footer className="site-footer">
        <span className="site-footer__copy">© {new Date().getFullYear()} Inspiro</span>
        <Link to="/privacy" className="site-footer__link">Политика конфиденциальности</Link>
        <Link to="/terms" className="site-footer__link">Условия использования</Link>
      </footer>
    </>
  );
};

export default Layout;


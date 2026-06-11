import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
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

  return (
    <>
      <Header />
      <div className={`header-spacer${isDetailPage ? ' header-spacer--detail' : ''}`} />
      <Outlet />
      <ScrollToTopButton />
    </>
  );
};

export default Layout;


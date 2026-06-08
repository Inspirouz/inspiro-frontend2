import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const Layout = () => {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  if (isSearchPage) {
    return <Outlet />;
  }

  return (
    <>
      <Header />
      <Outlet />
      <ScrollToTopButton />
    </>
  );
};

export default Layout;


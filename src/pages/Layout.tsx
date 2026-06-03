import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import NavLinks from "@/components/NavLinks";
import PromoBanner from "@/components/PromoBanner";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const Layout = () => {
  const location = useLocation();
  const isSubscriptionPage = location.pathname === '/subscription';
  const isDetailPage = location.pathname.startsWith('/detail');
  const isSearchPage = location.pathname === '/search';

  if (isSearchPage) {
    return <Outlet />;
  }

  return (
    <>
      <Header />
      {/* {!isSubscriptionPage && !isDetailPage && <PromoBanner />} */}
      {!isSubscriptionPage && !isDetailPage && <NavLinks />}
      <Outlet />
      <ScrollToTopButton />
    </>
  );
};

export default Layout;


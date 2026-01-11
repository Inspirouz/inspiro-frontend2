import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import NavLinks from "@/components/NavLinks";
import PromoBanner from "@/components/PromoBanner";
// import AuthPrompt from "@/components/AuthPrompt";

const Layout = () => {
  const location = useLocation();
  const isSubscriptionPage = location.pathname === '/subscription';
  const isDetailPage = location.pathname.startsWith('/detail');

  return (
    <>
      <Header />
      {!isSubscriptionPage && !isDetailPage && <PromoBanner />}
      {!isSubscriptionPage && !isDetailPage && <NavLinks />}
      <Outlet />
      {/* <AuthPrompt /> */}
    </>
  );
};

export default Layout;


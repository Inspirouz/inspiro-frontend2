import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import NavLinks from "@/components/NavLinks";

const Layout = () => {
  const location = useLocation();
  const isSubscriptionPage = location.pathname === '/subscription';

  return (
    <>
      <Header />
      {!isSubscriptionPage && <NavLinks />}
      <Outlet />
    </>
  );
};

export default Layout;


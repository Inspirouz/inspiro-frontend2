import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import NavLinks from "@/components/NavLinks";
import PromoBanner from "@/components/PromoBanner";
import AuthPrompt from "@/components/AuthPrompt";

const Layout = () => {
  const location = useLocation();
  const isSubscriptionPage = location.pathname === '/subscription';
  const isDetailPage = location.pathname.startsWith('/detail');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
const scrollThreshold = 2000; // 2000px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= scrollThreshold) {
        setShowAuthPrompt(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Header />
      {!isSubscriptionPage && !isDetailPage && <PromoBanner />}
      {!isSubscriptionPage && !isDetailPage && <NavLinks />}
      <Outlet />
      {/* {showAuthPrompt && <AuthPrompt />} */}
    </>
  );
};

export default Layout;


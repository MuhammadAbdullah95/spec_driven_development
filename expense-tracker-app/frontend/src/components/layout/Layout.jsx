import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      {/* Desktop Layout */}
      <div className="lg:flex lg:h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:overflow-hidden">
          {/* Content Area */}
          <main className={`
            flex-1 p-4 lg:p-8 lg:overflow-y-auto
            ${isMobile ? 'pb-24' : 'pb-8'}
          `}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={onNavigate}
        onMenuToggle={handleMenuToggle}
      />
    </div>
  );
};

export default Layout;

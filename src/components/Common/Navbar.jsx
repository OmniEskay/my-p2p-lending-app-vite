import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PAGES, APP_NAME } from '../../config/constants';
import Button from './Button'; // Assuming Button component is created

// Placeholder for an icon, replace with actual SVG or icon library
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


function Navbar({ setCurrentPage }) {
  const { currentUser, userData, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage(PAGES.LOGIN);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error);
      // Handle logout error (e.g., show a notification)
    }
  };

  const NavLink = ({ page, children }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setMobileMenuOpen(false);
      }}
      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-primary-light hover:text-primary-dark sm:text-sm sm:px-3 sm:py-2 sm:ml-4 sm:w-auto sm:text-gray-700 hover:text-primary"
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentPage(PAGES.DASHBOARD)} 
              className="text-2xl font-bold text-primary hover:text-primary-dark"
            >
              {APP_NAME}
            </button>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <>
                <NavLink page={PAGES.DASHBOARD}>Dashboard</NavLink>
                <NavLink page={PAGES.LEND}>Lend</NavLink>
                <NavLink page={PAGES.BORROW}>Borrow</NavLink>
                <NavLink page={PAGES.MY_LOANS}>My Loans</NavLink>
                <span className="text-sm text-gray-500 ml-4 hidden md:block">
                  Hi, {userData?.displayName || currentUser.email}
                </span>
                <Button onClick={handleLogout} variant="outline" className="ml-4 text-sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink page={PAGES.LOGIN}>Login</NavLink>
                <NavLink page={PAGES.SIGNUP}>Sign Up</NavLink>
              </>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary p-2 rounded-md"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 p-2 transition transform origin-top-right md:hidden bg-white shadow-lg ring-1 ring-black ring-opacity-5" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {currentUser ? (
              <>
                <NavLink page={PAGES.DASHBOARD}>Dashboard</NavLink>
                <NavLink page={PAGES.LEND}>Lend</NavLink>
                <NavLink page={PAGES.BORROW}>Borrow</NavLink>
                <NavLink page={PAGES.MY_LOANS}>My Loans</NavLink>
                <div className="px-3 py-2 text-sm text-gray-500">
                  Hi, {userData?.displayName || currentUser.email}
                </div>
                <Button onClick={handleLogout} variant="outline" fullWidth className="mt-2 text-sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink page={PAGES.LOGIN}>Login</NavLink>
                <NavLink page={PAGES.SIGNUP}>Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

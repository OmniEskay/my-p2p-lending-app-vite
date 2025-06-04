import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PAGES, APP_NAME } from '../../config/constants';
import Button from './Button'; // Assuming Button component is created and themed

// Icons (using existing simple SVGs, ensure they are styled with current color)
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
const UserCircleIcon = () => ( // Example icon for Edit Profile
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
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
      console.error("Navbar: Failed to log out:", error);
      // Potentially show a user-facing error notification here
    }
  };

  const NavLink = ({ page, children, isButton = false, className = "" }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setMobileMenuOpen(false);
      }}
      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium 
                 sm:text-sm sm:px-3 sm:py-2 sm:ml-4 sm:w-auto transition-colors duration-150
                 ${isButton 
                    ? `bg-primary text-white hover:bg-primary-dark ${className}` 
                    : `text-textLight hover:text-primary hover:bg-palette-cream ${className}`
                 }`}
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0 border-b border-palette-light-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentPage(PAGES.DASHBOARD)} 
              className="text-2xl font-extrabold text-primary hover:text-primary-dark transition-colors duration-150"
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
                <NavLink page={PAGES.EDIT_PROFILE} className="flex items-center">
                    <UserCircleIcon /> Edit Profile
                </NavLink>
                <span className="text-sm text-textLight ml-6 mr-3 hidden lg:block">
                  Hi, {userData?.displayName || currentUser.email}
                </span>
                <Button 
                    onClick={handleLogout} 
                    variant="outline" // This variant should use primary border/text from Button.jsx
                    className="ml-3 text-sm" // Ensure Button.jsx outline variant is themed
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink page={PAGES.LOGIN}>Login</NavLink>
                <NavLink page={PAGES.SIGNUP} isButton={true} className="ml-2">Sign Up</NavLink>
              </>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-textLight hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary p-2 rounded-md"
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
        <div className="sm:hidden absolute top-16 inset-x-0 p-2 transition transform origin-top-right shadow-lg bg-white ring-1 ring-black ring-opacity-5 border-t border-palette-light-blue" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {currentUser ? (
              <>
                <NavLink page={PAGES.DASHBOARD}>Dashboard</NavLink>
                <NavLink page={PAGES.LEND}>Lend</NavLink>
                <NavLink page={PAGES.BORROW}>Borrow</NavLink>
                <NavLink page={PAGES.MY_LOANS}>My Loans</NavLink>
                <NavLink page={PAGES.EDIT_PROFILE} className="flex items-center">
                    <UserCircleIcon /> Edit Profile
                </NavLink>
                <div className="px-3 py-3 border-t border-palette-light-blue mt-2">
                    <div className="text-sm text-textLight mb-2">
                    Signed in as: {userData?.displayName || currentUser.email}
                    </div>
                    <Button 
                        onClick={handleLogout} 
                        variant="outline" 
                        fullWidth 
                        className="text-sm"
                    >
                    Logout
                    </Button>
                </div>
              </>
            ) : (
              <>
                <NavLink page={PAGES.LOGIN}>Login</NavLink>
                <NavLink page={PAGES.SIGNUP} isButton={true}>Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

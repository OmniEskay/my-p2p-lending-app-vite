import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Common/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LendPage from './pages/LendPage';
import BorrowPage from './pages/BorrowPage';
import MyLoansPage from './pages/MyLoansPage';
import { PAGES, APP_NAME } from './config/constants';
import LoadingSpinner from './components/Common/LoadingSpinner';

// This component will handle routing logic based on auth state and currentPage
function AppContent() {
  const [currentPage, setCurrentPage] = useState(PAGES.LOGIN); // Default to login
  const { currentUser, loadingAuth } = useAuth();

  useEffect(() => {
    // Handle initial page based on authentication status
    if (!loadingAuth) {
      if (currentUser) {
        // If user is logged in and on login/signup, redirect to dashboard
        if (currentPage === PAGES.LOGIN || currentPage === PAGES.SIGNUP) {
          setCurrentPage(PAGES.DASHBOARD);
        }
      } else {
        // If user is not logged in and trying to access protected pages, redirect to login
        const protectedPages = [PAGES.DASHBOARD, PAGES.LEND, PAGES.BORROW, PAGES.MY_LOANS];
        if (protectedPages.includes(currentPage)) {
          setCurrentPage(PAGES.LOGIN);
        }
      }
    }
  }, [currentUser, loadingAuth, currentPage]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner text="Initializing App..." />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case PAGES.LOGIN:
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case PAGES.SIGNUP:
        return <SignupPage setCurrentPage={setCurrentPage} />;
      case PAGES.DASHBOARD:
        return currentUser ? <DashboardPage setCurrentPage={setCurrentPage} /> : <LoginPage setCurrentPage={setCurrentPage} />;
      case PAGES.LEND:
        return currentUser ? <LendPage setCurrentPage={setCurrentPage} /> : <LoginPage setCurrentPage={setCurrentPage} />;
      case PAGES.BORROW:
        return currentUser ? <BorrowPage setCurrentPage={setCurrentPage} /> : <LoginPage setCurrentPage={setCurrentPage} />; // Or allow browsing if not logged in
      case PAGES.MY_LOANS:
        return currentUser ? <MyLoansPage setCurrentPage={setCurrentPage} /> : <LoginPage setCurrentPage={setCurrentPage} />;
      default:
        return <LoginPage setCurrentPage={setCurrentPage} />;
    }
  };

  const showNavbar = currentUser && ![PAGES.LOGIN, PAGES.SIGNUP].includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {showNavbar && <Navbar setCurrentPage={setCurrentPage} />}
      <main className={`p-4 sm:p-6 md:p-8 ${showNavbar ? 'pt-20' : ''}`}> {/* Add padding-top if navbar is fixed */}
        {renderPage()}
      </main>
      <footer className="text-center py-4 text-xs text-gray-500 border-t border-gray-200">
        {APP_NAME} &copy; {new Date().getFullYear()}. Peer-to-Peer Lending.
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

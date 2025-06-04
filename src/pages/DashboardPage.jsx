import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAGES, APP_NAME } from '../config/constants'; // Ensure APP_NAME is imported
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getPlatformStats, getUserActivityStats } from '../services/firestoreService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

function DashboardPage({ setCurrentPage }) {
  const { currentUser, userData } = useAuth();
  const [platformStats, setPlatformStats] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true); // Set loading true at the beginning of any fetch attempt
      setError(''); // Clear previous errors

      try {
        const platformDataPromise = getPlatformStats();
        let userActivityDataPromise;

        if (currentUser) {
          userActivityDataPromise = getUserActivityStats(currentUser.uid);
          const [platformData, activityData] = await Promise.all([
            platformDataPromise,
            userActivityDataPromise
          ]);
          setPlatformStats(platformData);
          setUserActivity(activityData);
        } else {
          // Only fetch platform stats if no user is logged in
          const platformData = await platformDataPromise;
          setPlatformStats(platformData);
          setUserActivity(null); // Ensure user activity is null if no user
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      }
      setLoadingData(false);
    };

    fetchData();
  }, [currentUser]); // Re-fetch if the user changes

  if (loadingData) {
    return <LoadingSpinner text="Loading Dashboard Data..." />;
  }

  // Chart Data - using fetched data or defaults
  const loanVolumeByPurposeData = {
    labels: ['Debt Consolidation', 'Home Improvement', 'Business', 'Education', 'Other'],
    datasets: [
      {
        label: 'Loan Volume ($)',
        data: [ 
            (platformStats?.totalActiveLoanVolume || 0) * 0.3 || 15000, 
            (platformStats?.totalActiveLoanVolume || 0) * 0.25 || 12000, 
            (platformStats?.totalActiveLoanVolume || 0) * 0.2 || 10000, 
            (platformStats?.totalActiveLoanVolume || 0) * 0.15 || 7000, 
            (platformStats?.totalActiveLoanVolume || 0) * 0.1 || 5000
        ],
        backgroundColor: 'rgba(84, 119, 146, 0.6)', // palette-medium-blue with opacity
        borderColor: 'rgba(84, 119, 146, 1)',     // palette-medium-blue
        borderWidth: 1,
      },
    ],
  };

  const activeLoansStatusData = {
    labels: ['Active Loans', 'Total Offers'], 
    datasets: [
      {
        label: 'Count',
        data: [
            platformStats?.activeLoansCount || 0, 
            platformStats?.totalLoanOffers || 0
        ], 
        backgroundColor: [
            'rgba(84, 119, 146, 0.7)', // palette-medium-blue
            'rgba(148, 180, 193, 0.7)', // palette-light-blue
        ],
        borderColor: [
            'rgba(84, 119, 146, 1)',
            'rgba(148, 180, 193, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };


  return (
    <div className="space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-textDark">
          Welcome back, {userData?.displayName || currentUser?.email || "Guest"}!
        </h1>
        <p className="text-lg text-textLight mt-1">
          Your financial hub on {APP_NAME || "PeerLend"}. {/* Corrected to use APP_NAME */}
        </p>
      </header>

      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

      {/* Platform Statistics Section */}
      {platformStats && (
        <section>
          <h2 className="text-2xl font-semibold text-textDark mb-4">Platform Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Total Active Loan Volume</h3>
              <p className="text-3xl font-bold text-primary mt-1">${platformStats.totalActiveLoanVolume?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Active Loans Count</h3>
              <p className="text-3xl font-bold text-primary mt-1">{platformStats.activeLoansCount?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Avg. Interest Rate</h3>
              <p className="text-3xl font-bold text-primary mt-1">{platformStats.averageInterestRate?.toFixed(1) || '0'}%</p>
            </div>
             <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Total Loan Offers</h3>
              <p className="text-3xl font-bold text-primary mt-1">{platformStats.totalLoanOffers?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </section>
      )}

      {/* User Specific Activity Section */}
      {currentUser && userActivity && ( 
        <section>
          <h2 className="text-2xl font-semibold text-textDark mb-4">Your Financials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue">
              <h3 className="text-sm font-medium text-textLight">Your Loan Offers (Total)</h3>
              <p className="text-3xl font-bold text-textDark mt-1">{userActivity.loansOffered?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue">
              <h3 className="text-sm font-medium text-textLight">Active Borrowed Loans</h3>
              <p className="text-3xl font-bold text-textDark mt-1">{userActivity.loansBorrowed?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue">
              <h3 className="text-sm font-medium text-textLight">Total Invested (Active Loans)</h3>
              <p className="text-3xl font-bold text-green-600 mt-1">${userActivity.totalInvested?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue">
              <h3 className="text-sm font-medium text-textLight">Total Borrowed (Active Loans)</h3>
              <p className="text-3xl font-bold text-red-600 mt-1">${userActivity.totalBorrowed?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>
          </div>
        </section>
      )}
      
      {currentUser && ( 
        <section>
          <h2 className="text-2xl font-semibold text-textDark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Button onClick={() => setCurrentPage(PAGES.LEND)} variant="primary" className="py-5 text-lg shadow-md hover:shadow-lg transition-shadow">
              Offer a New Loan
            </Button>
            <Button onClick={() => setCurrentPage(PAGES.BORROW)} variant="primary" className="py-5 text-lg shadow-md hover:shadow-lg transition-shadow">
              Browse & Borrow Loans
            </Button>
            <Button onClick={() => setCurrentPage(PAGES.MY_LOANS)} className="py-5 text-lg shadow-md hover:shadow-lg transition-shadow bg-palette-light-blue text-textDark hover:bg-opacity-80 focus:ring-palette-medium-blue">
              Manage My Loans
            </Button>
          </div>
        </section>
      )}

      {/* Charts Section */}
      {platformStats && (
        <section>
          <h2 className="text-2xl font-semibold text-textDark mb-6">Platform Visual Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-palette-light-blue">
              <h3 className="text-lg font-medium text-textLight mb-3 text-center">Loan Volume by Purpose (Example)</h3>
              <div className="h-72 md:h-80">
                <Bar 
                    data={loanVolumeByPurposeData} 
                    options={{ 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false, labels: { color: '#213448'} } }, // textDark
                        scales: { 
                            y: { ticks: { color: '#547792' } }, // textLight
                            x: { ticks: { color: '#547792' } }  // textLight
                        }
                    }} 
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xl border border-palette-light-blue">
              <h3 className="text-lg font-medium text-textLight mb-3 text-center">Platform Overview (Example)</h3>
               <div className="h-72 md:h-80 flex items-center justify-center">
                <div className="w-full max-w-xs sm:max-w-sm">
                    <Doughnut 
                        data={activeLoansStatusData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: true, 
                            plugins: { legend: { position: 'bottom', labels: { color: '#213448'} } } // textDark
                        }} 
                    />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardPage;

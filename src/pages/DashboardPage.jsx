import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAGES, APP_NAME } from '../config/constants';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getPlatformStats, getUserActivityStats } from '../services/firestoreService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const defaultUserActivity = {
  loansOffered: 0,
  loansBorrowed: 0,
  totalInvested: 0,
  totalBorrowed: 0,
  loansLent: 0
};

function DashboardPage({ setCurrentPage }) {
  const { currentUser, userData, loadingAuth } = useAuth();
  const [platformStats, setPlatformStats] = useState(null);
  const [userActivity, setUserActivity] = useState(currentUser ? defaultUserActivity : null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for authentication to be resolved before attempting to fetch data
    if (loadingAuth) {
      setLoadingData(true); // Ensure loading spinner is shown while auth is resolving
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      setError('');

      try {
        if (currentUser && currentUser.uid) {
          // User is authenticated, fetch both platform and user-specific stats
          console.log("DashboardPage: Authenticated user found, fetching all data...");
          const [platformData, activityData] = await Promise.all([
            getPlatformStats(), // This requires auth based on current rules
            getUserActivityStats(currentUser.uid)
          ]);
          setPlatformStats(platformData);
          setUserActivity(activityData || defaultUserActivity);
        } else {
          // No authenticated user, or currentUser.uid is not available.
          // Platform stats might be public if rules allowed, but current rules require auth.
          console.log("DashboardPage: No authenticated user. Platform stats might not load if they require authentication.");
          // Attempt to fetch platform stats anyway; rules will dictate success.
          // If rules strictly require auth, this will likely result in a (handled) error or empty data.
          try {
            const platformData = await getPlatformStats();
            setPlatformStats(platformData);
          } catch (platformErr) {
            console.warn("DashboardPage: Could not fetch platform stats (likely due to auth requirement):", platformErr.message);
            setPlatformStats(null); // Ensure it's null if it fails
          }
          setUserActivity(null); // No user, so no user-specific activity
        }
      } catch (err) {
        console.error("DashboardPage: Error fetching dashboard data:", err);
        setError("Failed to load some dashboard data. Please ensure you are logged in if data is missing.");
        // Fallback states
        if (currentUser) {
          setUserActivity(defaultUserActivity);
        } else {
          setUserActivity(null);
        }
        // If platformStats also failed, ensure it's null
        setPlatformStats(prevStats => {
            // Check if the error specifically mentions platform stats or if platformStats is not yet set
            const isPlatformStatError = err.message.toLowerCase().includes("platform stats") || err.message.toLowerCase().includes("loanoffers") || err.message.toLowerCase().includes("activeloans");
            return isPlatformStatError || !prevStats ? null : prevStats;
        });
      }
      setLoadingData(false);
    };

    fetchData();

  }, [currentUser, loadingAuth]); // Re-fetch if currentUser or loadingAuth changes

  // Show a general loading spinner while auth state is being determined OR data is fetching
  if (loadingAuth || loadingData) {
    return <LoadingSpinner text={loadingAuth ? "Initializing Dashboard..." : "Loading Dashboard Data..."} />;
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
        backgroundColor: 'rgba(84, 119, 146, 0.6)', 
        borderColor: 'rgba(84, 119, 146, 1)',     
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
            'rgba(84, 119, 146, 0.7)', 
            'rgba(148, 180, 193, 0.7)', 
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
          Your financial hub on {APP_NAME}.
        </p>
      </header>

      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4 border border-red-300">{error}</p>}

      {/* Platform Statistics Section */}
      {platformStats ? (
        <section>
          <h2 className="text-2xl font-semibold text-textDark mb-4">Platform Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Total Active Loan Volume</h3>
              <p className="text-3xl font-bold text-primary mt-1">${platformStats.totalActiveLoanVolume?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Active Loans Count</h3>
              <p className="text-3xl font-bold text-primary mt-1">{platformStats.activeLoansCount?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Avg. Interest Rate</h3>
              <p className="text-3xl font-bold text-primary mt-1">{platformStats.averageInterestRate?.toFixed(1) || '0.0'}%</p>
            </div>
             <div className="bg-white p-5 rounded-xl shadow-lg border border-palette-light-blue hover:shadow-primary/20 transition-shadow">
              <h3 className="text-sm font-medium text-textLight">Total Loan Offers</h3>
              <p className="text-3xl font-bold text-primary mt-1">{platformStats.totalLoanOffers?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </section>
      ) : !loadingData && ( // Show message if platform stats couldn't be loaded (and not actively loading)
        <section>
            <h2 className="text-2xl font-semibold text-textDark mb-4">Platform Snapshot</h2>
            <p className="text-textLight bg-white p-4 rounded-md border border-palette-light-blue">
                {error ? "Could not load platform statistics due to an error." : "Platform statistics are currently unavailable."}
            </p>
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
      {platformStats && ( // Only show charts if platformStats are available
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
                        plugins: { legend: { display: false, labels: { color: '#213448'} } },
                        scales: { 
                            y: { ticks: { color: '#547792' } }, 
                            x: { ticks: { color: '#547792' } }  
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
                            plugins: { legend: { position: 'bottom', labels: { color: '#213448'} } } 
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoanDetailCard from '../components/Loans/LoanDetailCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getMyActiveLoans, recordPayment } from '../services/firestoreService';
import { PAGES, LOAN_STATUS } from '../config/constants'; // Ensure LOAN_STATUS is imported

function MyLoansPage({ setCurrentPage }) {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState(''); // For general page success messages
  const [actionError, setActionError] = useState(''); // For errors from actions like payment
  const [filter, setFilter] = useState('all'); // Initialize filter state

  useEffect(() => {
    if (currentUser) {
      console.log('MyLoansPage: Current user UID:', currentUser.uid);
      setLoading(true);
      setPageError(''); // Clear previous errors
      setPageSuccess(''); // Clear previous success messages
      setActionError(''); // Clear previous action errors

      const unsubscribe = getMyActiveLoans(currentUser.uid, (fetchedLoans) => {
        console.log('MyLoansPage: Fetched loans from service:', fetchedLoans);
        setLoans(fetchedLoans);
        setLoading(false);
      }, (err) => {
        console.error("MyLoansPage: Error fetching my loans:", err);
        setPageError("Failed to load your loans. Check console for details.");
        setLoading(false);
      });
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else {
        console.log('MyLoansPage: No current user.');
        setLoading(false);
        setLoans([]);
    }
  }, [currentUser]);

  const handleRecordPayment = async (loanId, paymentAmount) => {
    setPageSuccess(''); // Clear previous success
    setActionError(''); // Clear previous error
    if (isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
      setActionError("Invalid payment amount."); // Use actionError for this
      return;
    }
    try {
      await recordPayment(loanId, parseFloat(paymentAmount), currentUser.uid);
      setPageSuccess("Payment recorded successfully!"); // Use pageSuccess
    } catch (err) {
      console.error("Error recording payment on page:", err);
      setActionError(err.message || "Failed to record payment."); // Use actionError
    }
  };
  
  const filteredLoans = loans.filter(loan => {
    if (!currentUser) return false; // Should not happen if component renders based on currentUser
    if (filter === 'all') return true;
    if (filter === 'borrowed') return loan.borrowerId === currentUser.uid && loan.status === LOAN_STATUS.ACTIVE;
    if (filter === 'lent') return loan.lenderId === currentUser.uid && loan.status === LOAN_STATUS.ACTIVE;
    if (filter === 'repaid') return loan.status === LOAN_STATUS.REPAID && (loan.borrowerId === currentUser.uid || loan.lenderId === currentUser.uid);
    return true; 
  }).sort((a, b) => {
    // Sort active loans before repaid loans, then by creation date (newest first)
    const statusOrder = (status) => {
        if (status === LOAN_STATUS.ACTIVE) return 1;
        if (status === LOAN_STATUS.REPAID) return 2;
        return 3; // Other statuses
    };
    if (statusOrder(a.status) !== statusOrder(b.status)) {
        return statusOrder(a.status) - statusOrder(b.status);
    }
    const timeA = a.createdAt?.seconds || (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
    const timeB = b.createdAt?.seconds || (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
    return timeB - timeA;
  });

  // For console debugging
  // console.log('MyLoansPage: Filtered loans to render:', filteredLoans);
  // console.log('MyLoansPage: Current filter:', filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-textDark">My Loans</h1>
        <div className="flex flex-wrap gap-2 border border-palette-light-blue rounded-lg p-1.5 bg-gray-50 shadow-sm">
            {['all', 'borrowed', 'lent', 'repaid'].map(f_option => ( // Renamed f to f_option to avoid conflict
                <button 
                    key={f_option}
                    onClick={() => setFilter(f_option)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-150 ${filter === f_option ? 'bg-primary text-white shadow-md' : 'text-textLight hover:bg-palette-light-blue hover:text-textDark'}`}
                >{f_option.charAt(0).toUpperCase() + f_option.slice(1)}</button>
            ))}
        </div>
      </div>

      {pageError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{pageError}</p>}
      {pageSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{pageSuccess}</p>}
      {actionError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mt-2">{actionError}</p>}


      {loading ? (
        <LoadingSpinner text="Loading your loans..." />
      ) : filteredLoans.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md border border-palette-light-blue">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-palette-light-blue mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-textLight text-lg">
            {filter === 'all' && "You have no loans."}
            {filter === 'borrowed' && "You have no active borrowed loans."}
            {filter === 'lent' && "You have no active lent loans."}
            {filter === 'repaid' && "You have no repaid loans."}
          </p>
          <p className="text-textLight text-sm mt-2">
            {filter === 'all' && "Explore lending or borrowing options to get started."}
            {filter === 'borrowed' && <button onClick={() => setCurrentPage(PAGES.BORROW)} className="text-primary hover:text-primary-dark underline">Browse loans to borrow.</button>}
            {filter === 'lent' && <button onClick={() => setCurrentPage(PAGES.LEND)} className="text-primary hover:text-primary-dark underline">Offer a loan.</button>}
            {filter === 'repaid' && "Once loans are completed, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredLoans.map(loan => (
            <LoanDetailCard 
              key={loan.id} 
              loan={loan} 
              currentUserId={currentUser.uid}
              onRecordPayment={handleRecordPayment} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyLoansPage;

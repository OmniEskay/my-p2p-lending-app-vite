import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import OfferCard from '../components/Loans/OfferCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getAvailableLoanOffers, acceptLoanOffer } from '../services/firestoreService';
import { PAGES } from '../config/constants';
import Button from '../components/Common/Button';
import InputField from '../components/Common/InputField'; // Using InputField for consistency

function BorrowPage({ setCurrentPage }) {
  const { currentUser, userData } = useAuth();
  const [availableOffers, setAvailableOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(''); // For errors during initial load or pagination
  const [pageSuccess, setPageSuccess] = useState(''); // For success messages (e.g., after accepting an offer)
  const [actionError, setActionError] = useState(''); // Specifically for errors during the accept offer action
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    purpose: '', // Added purpose filter
    amountMin: '', 
    amountMax: '', 
    rateMax: '', 
    termMax: '' 
  });
  const [lastVisibleOffer, setLastVisibleOffer] = useState(null);
  const [hasMoreOffers, setHasMoreOffers] = useState(true);
  const PAGE_SIZE = 6;

  const fetchOffers = useCallback((loadMore = false) => {
    setLoading(true);
    setActionError(''); 
    
    const currentLastVisible = loadMore ? lastVisibleOffer : null;
    if (loadMore && !hasMoreOffers) {
        setLoading(false);
        return;
    }

    // Clear previous page error before new fetch
    if (!loadMore) setPageError('');


    const unsubscribe = getAvailableLoanOffers(
      currentUser?.uid, 
      (offers, newLastVisible) => {
        setAvailableOffers(prevOffers => loadMore ? [...prevOffers, ...offers] : offers);
        setLastVisibleOffer(newLastVisible);
        setHasMoreOffers(offers.length === PAGE_SIZE);
        setLoading(false);
      }, 
      (err) => {
        console.error("BorrowPage: Error fetching available loan offers:", err);
        setPageError("Failed to load loan offers. Please try refreshing or check the console.");
        setLoading(false);
      },
      filters, // Pass filters (currently for client-side, but service could adapt)
      currentLastVisible,
      PAGE_SIZE
    );
    return unsubscribe;
  }, [currentUser, filters, lastVisibleOffer, hasMoreOffers, PAGE_SIZE]); // Added PAGE_SIZE

  useEffect(() => {
    // Reset pagination and fetch when filters change
    setAvailableOffers([]); // Clear current offers to show loading for new filter results
    setLastVisibleOffer(null);
    setHasMoreOffers(true);
    const unsubscribe = fetchOffers(false); // Fetch first page with new filters
    return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
        }
    };
  }, [filters]); // Re-fetch only when filters change

  useEffect(() => {
    // Initial fetch when component mounts or currentUser changes (if not covered by filter change)
    // This ensures data loads if filters haven't been touched yet.
    if (!filters.purpose && !filters.amountMin && !filters.amountMax && !filters.rateMax && !filters.termMax) {
        const unsubscribe = fetchOffers(false);
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }
  }, [currentUser]); // Only re-run for currentUser change if filters are pristine


  const handleAcceptOffer = async (offer) => {
    if (!currentUser) {
      setActionError("You must be logged in to accept an offer.");
      // setCurrentPage(PAGES.LOGIN); // Optionally redirect
      return;
    }
    if (!window.confirm(`Are you sure you want to accept this loan offer of $${offer.amount.toLocaleString()} from ${offer.lenderName || 'a lender'}? This action cannot be undone.`)) {
      return;
    }
    setPageSuccess('');
    setActionError('');
    try {
      await acceptLoanOffer(offer.id, offer, currentUser.uid, userData?.displayName || currentUser.email);
      setPageSuccess(`Successfully accepted loan offer for $${offer.amount.toLocaleString()}! You can view it in 'My Loans'.`);
      setAvailableOffers(prev => prev.filter(o => o.id !== offer.id)); // Optimistically remove from list
      setHasMoreOffers(prev => availableOffers.length -1 < PAGE_SIZE ? false : prev); // Adjust hasMore if list shrinks significantly
    } catch (err) {
      console.error("BorrowPage: Error accepting loan offer:", err);
      setActionError(err.message || "Failed to accept loan offer. It might no longer be available or an error occurred.");
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    // Client-side search will apply automatically due to filteredOffers re-calculation
  };

  // Client-side filtering based on current `availableOffers` state
   const clientFilteredOffers = availableOffers.filter(offer => {
    const amount = parseFloat(offer.amount);
    const rate = parseFloat(offer.interestRate);
    const term = parseInt(offer.termMonths);
    const searchTermLower = searchTerm.toLowerCase();

    return (
        (searchTermLower === '' || 
         offer.lenderName?.toLowerCase().includes(searchTermLower) ||
         offer.purpose?.toLowerCase().includes(searchTermLower)
        ) &&
        (filters.purpose === '' || offer.purpose?.toLowerCase().includes(filters.purpose.toLowerCase())) &&
        (filters.amountMin === '' || isNaN(parseFloat(filters.amountMin)) || amount >= parseFloat(filters.amountMin)) &&
        (filters.amountMax === '' || isNaN(parseFloat(filters.amountMax)) || amount <= parseFloat(filters.amountMax)) &&
        (filters.rateMax === '' || isNaN(parseFloat(filters.rateMax)) || rate <= parseFloat(filters.rateMax)) &&
        (filters.termMax === '' || isNaN(parseInt(filters.termMax)) || term <= parseInt(filters.termMax))
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-textDark">Browse Available Loan Offers</h1>
      
      {pageError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{pageError}</p>}
      {pageSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{pageSuccess}</p>}
      {actionError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{actionError}</p>}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-palette-light-blue space-y-4">
        <InputField
          id="searchTerm"
          type="text"
          placeholder="Search by lender name or loan purpose..."
          value={searchTerm}
          onChange={handleSearchTermChange}
          label="Quick Search"
          labelClassName="text-textDark text-sm"
          inputClassName="focus:ring-primary focus:border-primary"
          className="mb-0"
        />
        <div>
            <h3 className="text-md font-semibold text-textDark mb-2">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <InputField name="purpose" value={filters.purpose} onChange={handleFilterChange} placeholder="Purpose (e.g., Business)" label="Purpose" labelClassName="text-xs text-textLight" inputClassName="text-sm p-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary" className="mb-0"/>
            <InputField type="number" name="amountMin" value={filters.amountMin} onChange={handleFilterChange} placeholder="Min ($)" label="Min Amount" labelClassName="text-xs text-textLight" inputClassName="text-sm p-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary" className="mb-0"/>
            <InputField type="number" name="amountMax" value={filters.amountMax} onChange={handleFilterChange} placeholder="Max ($)" label="Max Amount" labelClassName="text-xs text-textLight" inputClassName="text-sm p-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary" className="mb-0"/>
            <InputField type="number" name="rateMax" value={filters.rateMax} onChange={handleFilterChange} placeholder="Max Rate (%)" step="0.1" label="Max Rate" labelClassName="text-xs text-textLight" inputClassName="text-sm p-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary" className="mb-0"/>
            <InputField type="number" name="termMax" value={filters.termMax} onChange={handleFilterChange} placeholder="Max Term (mths)" label="Max Term" labelClassName="text-xs text-textLight" inputClassName="text-sm p-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary" className="mb-0"/>
            </div>
        </div>
      </div>

      {loading && clientFilteredOffers.length === 0 && <LoadingSpinner text="Loading available offers..." />}
      
      {!loading && clientFilteredOffers.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow-md border border-palette-light-blue">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-palette-light-blue mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
          </svg>
          <p className="text-textLight text-lg">No loan offers match your criteria or are currently available.</p>
          <p className="text-textLight text-sm mt-1">Try adjusting your search/filters or check back later.</p>
        </div>
      )}

      {clientFilteredOffers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientFilteredOffers.map(offer => (
            <OfferCard 
              key={offer.id} 
              offer={offer} 
              currentUserId={currentUser?.uid}
              onAccept={() => handleAcceptOffer(offer)}
              showLenderActions={false}
            />
          ))}
        </div>
      )}
      
      {/* Show loading spinner for "load more" only if not initial load and hasMoreOffers */}
      {loading && availableOffers.length > 0 && <div className="pt-4"><LoadingSpinner text="Loading more offers..." /></div>}

      {!loading && hasMoreOffers && clientFilteredOffers.length > 0 && (
        <div className="text-center mt-8">
          <Button onClick={() => fetchOffers(true)} variant="secondary" disabled={loading} className="bg-palette-light-blue text-textDark hover:bg-opacity-80">
            Load More Offers
          </Button>
        </div>
      )}

       {!currentUser && !loading && (
        <div className="mt-8 text-center p-4 bg-gray-100 rounded-lg border border-palette-light-blue">
            <p className="text-textLight">Please{' '}
                <button onClick={() => setCurrentPage(PAGES.LOGIN)} className="font-medium text-primary hover:text-primary-dark underline">log in</button>
                {' '}or{' '}
                <button onClick={() => setCurrentPage(PAGES.SIGNUP)} className="font-medium text-primary hover:text-primary-dark underline">sign up</button>
                {' '}to accept loan offers.
            </p>
        </div>
      )}
    </div>
  );
}

export default BorrowPage;

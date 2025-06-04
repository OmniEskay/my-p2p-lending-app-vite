import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import InputField from '../components/Common/InputField';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import OfferCard from '../components/Loans/OfferCard';
import { createLoanOffer, getMyLoanOffers, cancelLoanOffer } from '../services/firestoreService';
import { PAGES, MIN_LOAN_AMOUNT, MAX_LOAN_AMOUNT, LOAN_STATUS } from '../config/constants';

function LendPage({ setCurrentPage }) {
  const { currentUser, userData } = useAuth();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [myOffers, setMyOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  const [offerAmount, setOfferAmount] = useState('');
  const [offerInterestRate, setOfferInterestRate] = useState('');
  const [offerTerm, setOfferTerm] = useState('');
  const [offerPurpose, setOfferPurpose] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingOffers(true);
      setPageError('');
      const unsubscribe = getMyLoanOffers(currentUser.uid, (offers) => {
        setMyOffers(offers);
        setLoadingOffers(false);
      }, (err) => {
        console.error("LendPage: Error fetching my loan offers:", err);
        setPageError("Failed to load your loan offers. Please check the console for more details.");
        setLoadingOffers(false);
      });
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
        }
      };
    } else {
        // If no current user, ensure loading is false and offers are cleared.
        // The App.jsx should ideally prevent LendPage from rendering if not logged in.
        setLoadingOffers(false);
        setMyOffers([]);
        console.log("LendPage: No current user, cannot fetch offers.");
    }
  }, [currentUser]);

  const handleOpenOfferModal = () => {
    setOfferAmount('');
    setOfferInterestRate('');
    setOfferTerm('');
    setOfferPurpose('');
    setFormError('');
    setPageSuccess('');
    setIsOfferModalOpen(true);
  };

  const handleCloseOfferModal = () => {
    setIsOfferModalOpen(false);
    setFormError('');
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError("You must be logged in to create an offer.");
      return;
    }
    const amount = parseFloat(offerAmount);
    const rate = parseFloat(offerInterestRate);
    const term = parseInt(offerTerm);

    if (isNaN(amount) || amount < MIN_LOAN_AMOUNT || amount > MAX_LOAN_AMOUNT) {
      setFormError(`Offer amount must be between $${MIN_LOAN_AMOUNT} and $${MAX_LOAN_AMOUNT}.`);
      return;
    }
    if (isNaN(rate) || rate <= 0.1 || rate > 50) {
      setFormError("Interest rate must be a positive number (e.g., 0.1 to 50).");
      return;
    }
    if (isNaN(term) || term <= 0 || term > 120) {
      setFormError("Loan term must be a positive number of months (e.g., 1 to 120).");
      return;
    }
    if (!offerPurpose.trim()) {
      setFormError("Please provide a purpose for the loan offer.");
      return;
    }

    setSubmittingOffer(true);
    setFormError('');
    try {
      await createLoanOffer({
        lenderId: currentUser.uid,
        lenderName: userData?.displayName || currentUser.email,
        amount,
        interestRate: rate,
        termMonths: term,
        purpose: offerPurpose.trim(),
      });
      setPageSuccess("Loan offer created successfully!");
      handleCloseOfferModal();
    } catch (err) {
      console.error("LendPage: Error creating loan offer:", err);
      setFormError(err.message || "Failed to create loan offer. Please try again.");
    }
    setSubmittingOffer(false);
  };

  const handleCancelOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to cancel this loan offer? This action cannot be undone if the offer is not yet funded.")) {
      return;
    }
    setPageError('');
    setPageSuccess('');
    try {
      await cancelLoanOffer(offerId, currentUser.uid);
      setPageSuccess("Loan offer cancelled successfully.");
    } catch (err) {
      console.error("LendPage: Error cancelling offer:", err);
      setPageError(err.message || "Failed to cancel offer.");
    }
  };

  // If there's no logged-in user, App.jsx should redirect to LoginPage.
  // However, as a fallback or for clarity, we can show a message here too.
  if (!currentUser && !loadingOffers) { // Check !loadingOffers to avoid showing this during initial auth check
    return (
        <div className="text-center py-10">
            <p className="text-textLight text-lg">Please log in to manage or create loan offers.</p>
            <Button onClick={() => setCurrentPage(PAGES.LOGIN)} variant="primary" className="mt-4">
                Go to Login
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-textDark">Your Loan Offers</h1>
        {/* Explicitly styled button for guaranteed visibility using theme colors */}
        <button
            onClick={handleOpenOfferModal}
            className="px-4 py-2 rounded-md font-semibold shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary-dark text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
        >
          + Create New Loan Offer
        </button>
      </div>
      
      {pageError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{pageError}</p>}
      {pageSuccess && <p className="text-sm text-green-700 bg-green-100 p-3 rounded-md border border-green-300">{pageSuccess}</p>}

      {loadingOffers ? (
        <LoadingSpinner text="Loading your offers..." />
      ) : myOffers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md border border-palette-light-blue">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-palette-light-blue mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          <p className="text-textLight text-lg">You haven't created any loan offers yet.</p>
          <p className="text-textLight text-sm mt-1">Click "+ Create New Loan Offer" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myOffers.map(offer => (
            <OfferCard 
              key={offer.id} 
              offer={offer} 
              currentUserId={currentUser?.uid}
              onCancel={offer.status === LOAN_STATUS.AVAILABLE ? () => handleCancelOffer(offer.id) : null}
              showBorrowerActions={false}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isOfferModalOpen} 
        onClose={handleCloseOfferModal} 
        title="Create New Loan Offer"
      >
        <form onSubmit={handleSubmitOffer} className="space-y-4">
          <InputField
            id="offerAmount" label="Loan Amount ($)" type="number" value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)} placeholder={`e.g., ${MIN_LOAN_AMOUNT} - ${MAX_LOAN_AMOUNT}`}
            required min={MIN_LOAN_AMOUNT} max={MAX_LOAN_AMOUNT}
            labelClassName="text-textDark" inputClassName="focus:ring-primary focus:border-primary"
          />
          <InputField
            id="offerInterestRate" label="Annual Interest Rate (%)" type="number" step="0.01"
            value={offerInterestRate} onChange={(e) => setOfferInterestRate(e.target.value)}
            placeholder="e.g., 5.5" required min="0.1"
            labelClassName="text-textDark" inputClassName="focus:ring-primary focus:border-primary"
          />
          <InputField
            id="offerTerm" label="Loan Term (in months)" type="number" value={offerTerm}
            onChange={(e) => setOfferTerm(e.target.value)} placeholder="e.g., 12, 24, 36"
            required min="1"
            labelClassName="text-textDark" inputClassName="focus:ring-primary focus:border-primary"
          />
          <InputField
            id="offerPurpose" label="Purpose of Loan Offer" type="text" value={offerPurpose}
            onChange={(e) => setOfferPurpose(e.target.value)}
            placeholder="e.g., Debt Consolidation, Small Business Seed" required
            labelClassName="text-textDark" inputClassName="focus:ring-primary focus:border-primary"
          />
          {formError && <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md border border-red-300">{formError}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <Button 
                type="button" variant="secondary" onClick={handleCloseOfferModal} disabled={submittingOffer}
                className="text-textDark bg-palette-light-blue hover:bg-palette-light-blue/80 focus:ring-palette-medium-blue"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submittingOffer}>
              {submittingOffer ? <LoadingSpinner text="" size="sm" color="white"/> : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LendPage;

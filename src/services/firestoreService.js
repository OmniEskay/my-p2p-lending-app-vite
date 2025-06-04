import { db } from '../config/firebaseConfig';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  writeBatch,
  Timestamp,
  limit,
  startAfter,
  getCountFromServer,
  setDoc // <<< --- ADDED setDoc HERE ---
} from 'firebase/firestore';
import { COLLECTIONS, LOAN_STATUS } from '../config/constants';

// --- User Profile Functions ---
/**
 * Creates or updates a user's profile in Firestore.
 * @param {string} userId - The user's UID.
 * @param {object} profileData - Data to set for the user profile.
 */
export const updateUserProfile = async (userId, profileData) => {
  if (!userId) throw new Error("User ID is required.");
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  try {
    // Line 33 where the error occurred was likely this setDoc call
    await setDoc(userRef, { 
      ...profileData, 
      lastUpdated: serverTimestamp() 
    }, { merge: true }); // merge: true to update existing doc or create if not exists
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
};

/**
 * Fetches a user's profile from Firestore.
 * @param {string} userId - The user's UID.
 * @returns {Promise<object|null>} User profile data or null if not found.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  try {
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw error;
  }
};


// --- Loan Offer Functions (Lender Actions) ---

/**
 * Creates a new loan offer.
 * @param {object} offerData - Data for the new loan offer.
 * Expected fields: lenderId, lenderName, amount, interestRate, termMonths, [purpose]
 */
export const createLoanOffer = async (offerData) => {
  if (!offerData.lenderId) throw new Error("Lender ID is required to create an offer.");
  if (!offerData.lenderName) console.warn("Lender name is missing in offerData.");
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.LOAN_OFFERS), {
      ...offerData,
      amount: parseFloat(offerData.amount),
      interestRate: parseFloat(offerData.interestRate),
      termMonths: parseInt(offerData.termMonths),
      status: LOAN_STATUS.AVAILABLE,
      createdAt: serverTimestamp(),
      borrowerId: null,
      borrowerName: null,
      fundedAt: null,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating loan offer: ", error);
    throw error;
  }
};

/**
 * Fetches loan offers created by a specific lender.
 * @param {string} lenderId - The ID of the lender.
 * @param {function} callback - Function to call with the offers array.
 * @param {function} errorCallback - Function to call on error.
 * @returns {function} Unsubscribe function for the listener.
 */
export const getMyLoanOffers = (lenderId, callback, errorCallback) => {
  const q = query(
    collection(db, COLLECTIONS.LOAN_OFFERS), 
    where("lenderId", "==", lenderId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const offers = [];
    querySnapshot.forEach((doc) => {
      offers.push({ id: doc.id, ...doc.data() });
    });
    callback(offers);
  }, (error) => {
    console.error("Error fetching lender's loan offers: ", error);
    if (errorCallback) errorCallback(error);
  });
};

/**
 * Cancels a loan offer if it's still available.
 * @param {string} offerId - The ID of the loan offer to cancel.
 * @param {string} lenderId - The ID of the lender attempting to cancel.
 */
export const cancelLoanOffer = async (offerId, lenderId) => {
  const offerRef = doc(db, COLLECTIONS.LOAN_OFFERS, offerId);
  try {
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) throw new Error("Loan offer not found.");
    
    const offerData = offerSnap.data();
    if (offerData.lenderId !== lenderId) throw new Error("You are not authorized to cancel this offer.");
    if (offerData.status !== LOAN_STATUS.AVAILABLE) throw new Error("Only available offers can be cancelled.");

    await updateDoc(offerRef, { 
      status: LOAN_STATUS.CANCELLED,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error cancelling loan offer: ", error);
    throw error;
  }
};


// --- Loan Browsing & Acceptance Functions (Borrower Actions) ---

/**
 * Fetches all available loan offers (excluding those by the current user, if provided).
 * @param {string|null} currentUserId - Optional ID of the current user to exclude their own offers.
 * @param {function} callback - Function to call with the offers array and the last visible document.
 * @param {function} errorCallback - Function to call on error.
 * @param {object} filters - Object containing filter criteria (currently not used for Firestore query, client-side).
 * @param {DocumentSnapshot} lastVisible - The last document snapshot from the previous fetch (for pagination).
 * @param {number} pageSize - The number of offers to fetch per page.
 * @returns {function} Unsubscribe function for the listener.
 */
export const getAvailableLoanOffers = (currentUserId, callback, errorCallback, filters = {}, lastVisible = null, pageSize = 9) => {
  let q = query(
    collection(db, COLLECTIONS.LOAN_OFFERS), 
    where("status", "==", LOAN_STATUS.AVAILABLE)
  );

  q = query(q, orderBy("createdAt", "asc")); 

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }
  q = query(q, limit(pageSize));

  return onSnapshot(q, (querySnapshot) => {
    const offers = [];
    querySnapshot.forEach((doc) => {
      if (currentUserId && doc.data().lenderId === currentUserId) {
        return; 
      }
      offers.push({ id: doc.id, ...doc.data() });
    });
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    callback(offers, newLastVisible); 
  }, (error) => {
    console.error("Error fetching available loan offers: ", error);
    if (errorCallback) errorCallback(error);
  });
};

/**
 * Accepts a loan offer, updates its status, and creates an active loan document.
 * @param {string} offerId - The ID of the loan offer being accepted.
 * @param {object} offerData - The data of the offer being accepted.
 * @param {string} borrowerId - The ID of the borrower.
 * @param {string} borrowerName - The name of the borrower.
 */
export const acceptLoanOffer = async (offerId, offerData, borrowerId, borrowerName) => {
  if (!borrowerId) throw new Error("Borrower ID is required to accept an offer.");
  if (!borrowerName) console.warn("Borrower name is missing.");

  const offerRef = doc(db, COLLECTIONS.LOAN_OFFERS, offerId);
  const activeLoanRef = doc(collection(db, COLLECTIONS.ACTIVE_LOANS)); 

  const batch = writeBatch(db);

  try {
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists() || offerSnap.data().status !== LOAN_STATUS.AVAILABLE) {
      throw new Error("This loan offer is no longer available or does not exist.");
    }
    if (offerSnap.data().lenderId === borrowerId) {
        throw new Error("You cannot accept your own loan offer.");
    }

    batch.update(offerRef, {
      status: LOAN_STATUS.FUNDED,
      borrowerId: borrowerId,
      borrowerName: borrowerName,
      fundedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const P = parseFloat(offerData.amount);
    const annualRate = parseFloat(offerData.interestRate);
    const N = parseInt(offerData.termMonths);
    let monthlyPayment = 0;

    if (N > 0) {
        if (annualRate === 0) { 
            monthlyPayment = P / N;
        } else {
            const r = (annualRate / 100) / 12; 
            monthlyPayment = P * (r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
            if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
                console.warn("Calculated monthly payment is NaN or Infinite. Defaulting based on simple division for safety.");
                monthlyPayment = (P * (1 + (annualRate/100) * (N/12))) / N; 
            }
        }
    } else {
        throw new Error("Loan term (N) must be greater than 0.");
    }
    
    const totalRepayment = monthlyPayment * N;

    batch.set(activeLoanRef, {
      offerId: offerId,
      lenderId: offerData.lenderId,
      lenderName: offerData.lenderName || "N/A",
      borrowerId: borrowerId,
      borrowerName: borrowerName,
      principalAmount: P,
      interestRate: annualRate,
      termMonths: N,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      remainingBalance: parseFloat(totalRepayment.toFixed(2)), 
      paymentsMade: [],
      status: LOAN_STATUS.ACTIVE,
      startDate: serverTimestamp(), 
      createdAt: serverTimestamp(),
    });

    await batch.commit();
    return activeLoanRef.id;

  } catch (error) {
    console.error("Error accepting loan offer: ", error);
    throw error;
  }
};


// --- Active Loan Management Functions ---

/**
 * Fetches all active loans for a given user (both as lender and borrower).
 * @param {string} userId - The ID of the user.
 * @param {function} callback - Function to call with the loans array.
 * @param {function} errorCallback - Function to call on error.
 * @returns {function} Unsubscribe function for the listener.
 */
export const getMyActiveLoans = (userId, callback, errorCallback) => {
  const loansAsLenderQuery = query(
    collection(db, COLLECTIONS.ACTIVE_LOANS), 
    where("lenderId", "==", userId)
  );
  const loansAsBorrowerQuery = query(
    collection(db, COLLECTIONS.ACTIVE_LOANS), 
    where("borrowerId", "==", userId)
  );

  let lenderLoans = [];
  let borrowerLoans = [];

  const combineAndCallback = () => {
    const allLoansMap = new Map();
    [...lenderLoans, ...borrowerLoans].forEach(loan => allLoansMap.set(loan.id, loan));
    const combinedLoans = Array.from(allLoansMap.values()).sort((a, b) => {
        const timeA = a.createdAt?.seconds || (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0);
        const timeB = b.createdAt?.seconds || (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0);
        return timeB - timeA; 
    });
    callback(combinedLoans);
  };

  const unsubLender = onSnapshot(loansAsLenderQuery, (snapshot) => {
    lenderLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    combineAndCallback();
  }, errorCallback);

  const unsubBorrower = onSnapshot(loansAsBorrowerQuery, (snapshot) => {
    borrowerLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    combineAndCallback();
  }, errorCallback);
  
  return () => { 
    unsubLender();
    unsubBorrower();
  };
};

/**
 * Records a payment made by a borrower for a specific loan.
 * @param {string} loanId - The ID of the active loan.
 * @param {number} paymentAmount - The amount of the payment.
 * @param {string} borrowerId - The ID of the borrower making the payment (for verification).
 */
export const recordPayment = async (loanId, paymentAmount, borrowerId) => {
  const loanRef = doc(db, COLLECTIONS.ACTIVE_LOANS, loanId);
  try {
    const loanSnap = await getDoc(loanRef);
    if (!loanSnap.exists()) throw new Error("Loan not found.");

    const loanData = loanSnap.data();
    if (loanData.borrowerId !== borrowerId) throw new Error("You are not authorized to make payments on this loan.");
    if (loanData.status !== LOAN_STATUS.ACTIVE) throw new Error("Payments can only be made on active loans.");
    
    const paymentAmountNum = parseFloat(paymentAmount);
    if (isNaN(paymentAmountNum) || paymentAmountNum <= 0) throw new Error("Invalid payment amount.");
    if (paymentAmountNum > loanData.remainingBalance + 0.01) { 
         throw new Error(`Payment amount $${paymentAmountNum.toFixed(2)} exceeds remaining balance of $${loanData.remainingBalance.toFixed(2)}.`);
    }

    const newRemainingBalance = parseFloat((loanData.remainingBalance - paymentAmountNum).toFixed(2));
    const newStatus = newRemainingBalance <= 0.005 ? LOAN_STATUS.REPAID : LOAN_STATUS.ACTIVE;

    const paymentRecord = {
      amount: paymentAmountNum,
      date: serverTimestamp(), 
    };

    await updateDoc(loanRef, {
      remainingBalance: newRemainingBalance,
      paymentsMade: [...(loanData.paymentsMade || []), paymentRecord],
      status: newStatus,
      lastPaymentAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error recording payment: ", error);
    throw error;
  }
};

// --- Dashboard/Platform Statistics ---
/**
 * Gets a count of documents in a collection that match a query.
 * @param {Query} q - The Firestore query.
 * @returns {Promise<number>} Total count of documents.
 */
const getQueryCount = async (q) => {
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
};

export const getPlatformStats = async () => {
    try {
        const totalOffersQuery = query(collection(db, COLLECTIONS.LOAN_OFFERS));
        const activeLoansQuery = query(collection(db, COLLECTIONS.ACTIVE_LOANS), where("status", "==", LOAN_STATUS.ACTIVE));
        
        const totalOffersCountPromise = getQueryCount(totalOffersQuery);
        const activeLoansSnapshotPromise = getDocs(activeLoansQuery); 

        const [totalOffersCount, activeLoansSnapshot] = await Promise.all([
            totalOffersCountPromise, 
            activeLoansSnapshotPromise
        ]);
        
        let totalLoanVolume = 0;
        let totalInterestRateSum = 0;
        activeLoansSnapshot.forEach(doc => {
            const data = doc.data();
            totalLoanVolume += data.principalAmount || 0;
            totalInterestRateSum += data.interestRate || 0;
        });
        const activeLoansCount = activeLoansSnapshot.size;
        const averageInterestRate = activeLoansCount > 0 ? (totalInterestRateSum / activeLoansCount) : 0;

        return {
            totalLoanOffers: totalOffersCount,
            activeLoansCount: activeLoansCount,
            totalActiveLoanVolume: parseFloat(totalLoanVolume.toFixed(2)),
            averageInterestRate: parseFloat(averageInterestRate.toFixed(2)),
        };
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        throw error; 
    }
};

export const getUserActivityStats = async (userId) => {
    if (!userId) return { loansOffered: 0, loansBorrowed: 0, totalInvested: 0, totalBorrowed: 0, loansLent: 0 };
    try {
        const offersQuery = query(collection(db, COLLECTIONS.LOAN_OFFERS), where("lenderId", "==", userId));
        const borrowedQuery = query(collection(db, COLLECTIONS.ACTIVE_LOANS), where("borrowerId", "==", userId), where("status", "==", LOAN_STATUS.ACTIVE));
        const lentQuery = query(collection(db, COLLECTIONS.ACTIVE_LOANS), where("lenderId", "==", userId), where("status", "==", LOAN_STATUS.ACTIVE));

        const [offersSnapshot, borrowedSnapshot, lentSnapshot] = await Promise.all([
            getDocs(offersQuery), 
            getDocs(borrowedQuery), 
            getDocs(lentQuery) 
        ]);

        let totalInvested = 0;
        lentSnapshot.forEach(doc => totalInvested += (doc.data().principalAmount || 0));
        
        let totalBorrowed = 0;
        borrowedSnapshot.forEach(doc => totalBorrowed += (doc.data().principalAmount || 0));

        return {
            loansOffered: offersSnapshot.size, 
            loansBorrowed: borrowedSnapshot.size, 
            loansLent: lentSnapshot.size, 
            totalInvested: parseFloat(totalInvested.toFixed(2)), 
            totalBorrowed: parseFloat(totalBorrowed.toFixed(2)), 
        };

    } catch (error) {
        console.error("Error fetching user activity stats:", error);
        throw error; 
    }
};

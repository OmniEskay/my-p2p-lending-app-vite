// Application-wide constants

export const APP_NAME = "PeerLend";

export const PAGES = {
  LOGIN: 'LOGIN',
  SIGNUP: 'SIGNUP',
  DASHBOARD: 'DASHBOARD',
  LEND: 'LEND', // Page for lenders to offer loans
  BORROW: 'BORROW', // Page for borrowers to request or browse loans
  MY_LOANS: 'MY_LOANS', // Page for users to see their active loans (both lent and borrowed)
  LOAN_DETAIL: 'LOAN_DETAIL', // For viewing a specific loan
  CREATE_LOAN_OFFER: 'CREATE_LOAN_OFFER', // Lenders create offers
  CREATE_LOAN_REQUEST: 'CREATE_LOAN_REQUEST', // Borrowers create requests
  EDIT_PROFILE: 'EDIT_PROFILE', // Add this
};

export const LOAN_STATUS = {
  AVAILABLE: 'available', // Loan offer is available for funding
  PENDING_APPROVAL: 'pending_approval', // Loan request waiting for platform/lender approval
  FUNDED: 'funded', // Loan has been fully funded
  ACTIVE: 'active', // Loan is active and being repaid
  REPAID: 'repaid', // Loan has been fully repaid
  CANCELLED: 'cancelled', // Loan offer/request was cancelled
  DEFAULTED: 'defaulted', // Loan is in default
};

// Firebase collection names
export const COLLECTIONS = {
  USERS: 'users',
  LOAN_OFFERS: 'loanOffers', // Offers made by lenders
  LOAN_REQUESTS: 'loanRequests', // Requests made by borrowers
  ACTIVE_LOANS: 'activeLoans', // Loans that are funded and ongoing
};

// You can add more constants here, like interest rate ranges, loan term options, etc.
export const MIN_LOAN_AMOUNT = 100;
export const MAX_LOAN_AMOUNT = 50000;
export const DEFAULT_INTEREST_RATE = 5.0; // Default annual percentage rate
export const DEFAULT_LOAN_TERM_MONTHS = 12; // Default loan term in months

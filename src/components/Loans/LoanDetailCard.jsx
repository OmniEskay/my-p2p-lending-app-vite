import React, { useState } from 'react';
import Button from '../Common/Button';
import InputField from '../Common/InputField';
import LoadingSpinner from '../Common/LoadingSpinner';
import { LOAN_STATUS } from '../../config/constants';
import { formatDate } from '../../utils/formatDate';

// Icons using theme colors
const UserRoleIcon = ({ colorClass = "text-primary" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 mr-1.5 inline-block ${colorClass}`}>
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 12.75a9.99 9.99 0 00-6.535 1.743z" />
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block text-textLight">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);
const InfoIcon = ({ className = "w-4 h-4 mr-1.5 inline-block text-primary" }) => ( // Changed default to primary for detail items
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);


function LoanDetailCard({ loan, currentUserId, onRecordPayment }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const isBorrower = loan.borrowerId === currentUserId;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!onRecordPayment) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError("Please enter a valid positive payment amount.");
      return;
    }
    if (amount > (loan.remainingBalance + 0.001)) {
      setPaymentError(`Payment cannot exceed remaining balance of $${loan.remainingBalance?.toFixed(2)}.`);
      return;
    }

    setPaymentError('');
    setIsPaying(true);
    try {
      await onRecordPayment(loan.id, amount);
      setPaymentAmount(''); 
    } catch (err) {
      setPaymentError(err.message || "Failed to record payment.");
    }
    setIsPaying(false);
  };

  const getStatusPillStyle = (status) => {
    // Using more vibrant theme-aligned status colors
    switch (status) {
      case LOAN_STATUS.ACTIVE: return "bg-yellow-400/20 text-yellow-700 border-yellow-500"; 
      case LOAN_STATUS.REPAID: return "bg-green-400/20 text-green-700 border-green-500";   
      case LOAN_STATUS.DEFAULTED: return "bg-red-400/20 text-red-700 border-red-500";     
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };
  
  const principalAmount = loan.principalAmount || loan.amount || 0;
  const remainingBalance = loan.remainingBalance ?? principalAmount; 
  const paymentsMade = loan.paymentsMade || [];
  const progressPercentage = principalAmount > 0 ? ((principalAmount - remainingBalance) / principalAmount) * 100 : 0;


  return (
    <div className="bg-white rounded-xl shadow-lg border border-palette-light-blue/70 p-6 space-y-4"> {/* Slightly softer border */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-xl font-semibold text-primary">
          Loan ID: <span className="font-normal text-textDark">{loan.id?.substring(0, 8)}...</span>
        </h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusPillStyle(loan.status)}`}>
          Status: {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1) || "Unknown"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <p className="flex items-center"><InfoIcon /> <strong className="text-textLight mr-1">Principal:</strong> <span className="text-textDark font-medium">${principalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p className="flex items-center"><InfoIcon /> <strong className="text-textLight mr-1">Interest Rate:</strong> <span className="text-textDark font-medium">{loan.interestRate?.toFixed(1)}% APR</span></p>
        <p className="flex items-center"><InfoIcon /> <strong className="text-textLight mr-1">Term:</strong> <span className="text-textDark font-medium">{loan.termMonths} months</span></p>
        <p className="flex items-center"><InfoIcon /> <strong className="text-textLight mr-1">Monthly Payment:</strong> <span className="text-textDark font-medium">${loan.monthlyPayment?.toFixed(2) || 'N/A'}</span></p>
        <p className="flex items-center"><UserRoleIcon colorClass="text-green-600"/> <strong className="text-textLight mr-1">Lender:</strong> <span className="text-textDark font-medium">{loan.lenderName || loan.lenderId?.substring(0,10)}...</span></p>
        <p className="flex items-center"><UserRoleIcon colorClass="text-blue-600"/> <strong className="text-textLight mr-1">Borrower:</strong> <span className="text-textDark font-medium">{loan.borrowerName || loan.borrowerId?.substring(0,10)}...</span></p>
        <p className="flex items-center col-span-1 md:col-span-2"><CalendarIcon /><strong className="text-textLight mr-1">Start Date:</strong> <span className="text-textDark font-medium">{formatDate(loan.startDate || loan.fundedAt || loan.createdAt)}</span></p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-textLight">Remaining Balance: 
          <span className="text-2xl font-bold text-green-600 ml-2">
            ${remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
        {principalAmount > 0 && (
            <div className="w-full bg-palette-light-blue/50 rounded-full h-3 mt-2"> {/* Softer track for progress bar */}
                <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
                ></div>
            </div>
        )}
         <p className="text-xs text-textLight text-right mt-1">{progressPercentage.toFixed(1)}% Paid</p>
      </div>

      {isBorrower && loan.status === LOAN_STATUS.ACTIVE && onRecordPayment && (
        <form onSubmit={handlePaymentSubmit} className="pt-4 border-t border-palette-light-blue/70 space-y-3"> {/* Softer border */}
          <h4 className="text-md font-semibold text-textDark">Record a Payment</h4>
          <InputField
            id={`payment-${loan.id}`}
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder={`Max $${remainingBalance?.toFixed(2)}`}
            step="0.01"
            min="0.01"
            max={remainingBalance}
            error={paymentError} 
            className="mb-0"
            labelClassName="text-textDark" 
            inputClassName="focus:border-primary focus:ring-primary text-textDark" // Ensure input text is dark
          />
          <Button type="submit" variant="primary" disabled={isPaying} fullWidth>
            {isPaying ? <LoadingSpinner text="Processing..." size="sm" color="white"/> : 'Submit Payment'}
          </Button>
        </form>
      )}
      
      {paymentsMade.length > 0 && (
        <div className="pt-4 border-t border-palette-light-blue/70"> {/* Softer border */}
            <button 
                onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                className="text-sm font-medium text-primary hover:text-primary-dark hover:underline w-full text-left mb-2 focus:outline-none"
            >
                {showPaymentHistory ? 'Hide' : 'Show'} Payment History ({paymentsMade.length})
            </button>
            {showPaymentHistory && (
                <ul className="space-y-1 text-xs max-h-40 overflow-y-auto bg-palette-cream/70 p-3 rounded-md border border-palette-light-blue/50"> {/* Softer bg and border */}
                    {paymentsMade.slice().reverse().map((payment, index) => (
                        <li key={index} className="flex justify-between items-center p-1.5 rounded hover:bg-palette-light-blue/40">
                            <span className="text-textLight">{formatDate(payment.date)}</span>
                            <span className="font-semibold text-green-600">${payment.amount?.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      )}
    </div>
  );
}

export default LoanDetailCard;

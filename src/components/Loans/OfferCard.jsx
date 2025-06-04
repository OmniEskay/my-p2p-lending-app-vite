import React from 'react';
import Button from '../Common/Button';
import { LOAN_STATUS } from '../../config/constants';
import { formatDate } from '../../utils/formatDate';

// Updated Icons to use theme colors
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block text-textLight">
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 12.75a9.99 9.99 0 00-6.535 1.743z" />
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block text-textLight">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);
const InfoIcon = ({ className = "w-4 h-4 mr-1.5 inline-block text-textLight" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);


function OfferCard({ offer, currentUserId, onAccept, onCancel, onDetailsClick, showBorrowerActions = true, showLenderActions = true }) {
  const isMyOffer = offer.lenderId === currentUserId;
  const canBeAccepted = showBorrowerActions && offer.status === LOAN_STATUS.AVAILABLE && !isMyOffer && currentUserId;
  const canBeCancelledByLender = showLenderActions && offer.status === LOAN_STATUS.AVAILABLE && isMyOffer && onCancel;

  const getStatusPillStyle = (status) => {
    switch (status) {
      case LOAN_STATUS.AVAILABLE: return "bg-green-100 text-green-800 border-green-400";
      case LOAN_STATUS.FUNDED: return "bg-blue-100 text-blue-800 border-blue-400"; // Using more distinct blue
      case LOAN_STATUS.CANCELLED: return "bg-red-100 text-red-800 border-red-400";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-palette-light-blue p-5 flex flex-col justify-between hover:shadow-primary/20 transition-shadow duration-200 h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-primary">
            ${offer.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusPillStyle(offer.status)}`}>
            {offer.status?.charAt(0).toUpperCase() + offer.status?.slice(1) || "N/A"}
          </span>
        </div>
        <div className="space-y-1 text-sm mb-3">
            <p className="flex items-center text-textLight">
                <InfoIcon className="w-4 h-4 mr-1.5 inline-block text-primary"/> Interest Rate: <span className="text-textDark ml-1 font-medium">{offer.interestRate?.toFixed(1)}% APR</span>
            </p>
            <p className="flex items-center text-textLight">
                <InfoIcon className="w-4 h-4 mr-1.5 inline-block text-primary"/> Term: <span className="text-textDark ml-1 font-medium">{offer.termMonths} months</span>
            </p>
            {offer.purpose && (
                <p className="flex items-center text-textLight">
                    <InfoIcon className="w-4 h-4 mr-1.5 inline-block text-primary"/> Purpose: <span className="text-textDark ml-1 font-medium">{offer.purpose}</span>
                </p>
            )}
        </div>
        <p className="text-xs text-textLight mt-2 flex items-center">
          <UserIcon /> Offered by: <span className="text-textDark ml-1 font-medium">{isMyOffer ? "You" : (offer.lenderName || "A Lender")}</span>
        </p>
        {offer.createdAt && (
          <p className="text-xs text-textLight mt-1 flex items-center">
            <CalendarIcon /> Created: <span className="text-textDark ml-1 font-medium">{formatDate(offer.createdAt)}</span>
          </p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-palette-light-blue space-y-2"> {/* mt-auto pushes buttons to bottom */}
        {onDetailsClick && (
          <Button onClick={onDetailsClick} variant="outline" fullWidth className="text-sm border-primary text-primary hover:bg-primary/10">
            View Details
          </Button>
        )}
        {canBeAccepted && onAccept && (
          <Button onClick={onAccept} variant="primary" fullWidth className="text-sm">
            Accept Offer & Borrow
          </Button>
        )}
        {canBeCancelledByLender && (
          <Button onClick={onCancel} variant="danger" fullWidth className="text-sm">
            Cancel Offer
          </Button>
        )}
        {offer.status === LOAN_STATUS.FUNDED && (
            <p className="text-xs text-center text-blue-700 font-medium">This loan has been funded.</p>
        )}
         {offer.status === LOAN_STATUS.CANCELLED && (
            <p className="text-xs text-center text-red-700 font-medium">This offer has been cancelled.</p>
        )}
      </div>
    </div>
  );
}

export default OfferCard;

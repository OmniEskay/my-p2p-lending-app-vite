import React from 'react';

function Modal({ isOpen, onClose, title, children, size = 'md', titleClassName = '' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl', // Added larger sizes
    '4xl': 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal on overlay click
    >
      <div 
        className={`bg-white p-6 rounded-xl shadow-2xl w-full ${sizeClasses[size]} 
                   transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear 
                   border border-palette-light-blue/50 max-h-[90vh] flex flex-col`} // Added max-h and flex structure
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-palette-light-blue">
          {/* Modal title now uses textDark from your theme */}
          <h3 className={`text-xl font-semibold text-textDark ${titleClassName}`}> 
            {title}
          </h3>
          <button 
            onClick={onClose} 
            // Close button uses textLight and hover:textDark from your theme
            className="text-textLight hover:text-textDark text-3xl leading-none p-1 -mr-2 rounded-full hover:bg-palette-cream focus:outline-none focus:ring-2 focus:ring-palette-medium-blue"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {/* Added overflow-y-auto for scrollable content if it exceeds modal height */}
        <div className="overflow-y-auto flex-grow"> 
          {children}
        </div>
      </div>
      {/* Ensure this style block is not causing issues if you're using Tailwind exclusively for styling.
          It's generally better to handle animations with Tailwind's animation utilities if possible,
          or ensure this doesn't conflict with your PostCSS setup.
          For simplicity and since it was in the original, I'll keep it, but be mindful.
      */}
      <style jsx global>{`
        @keyframes modal-appear {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s forwards;
        }
      `}</style>
    </div>
  );
}

export default Modal;

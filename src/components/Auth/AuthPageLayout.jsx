import React from 'react';
import { APP_NAME } from '../../config/constants';

function AuthPageLayout({ title, children, footerText, footerLinkText, onFooterLinkClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-4xl font-extrabold text-primary-dark">
          {APP_NAME}
        </h1>
        <h2 className="mt-2 text-center text-xl text-gray-600">
          {title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10">
          {children}
          {footerText && footerLinkText && (
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                {footerText}{' '}
                <button
                  onClick={onFooterLinkClick}
                  className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline"
                >
                  {footerLinkText}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPageLayout;

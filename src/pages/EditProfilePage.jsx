import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/firestoreService';
import InputField from '../components/Common/InputField';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { PAGES } from '../config/constants';
import { formatDate } from '../utils/formatDate'; // For displaying createdAt

function EditProfilePage({ setCurrentPage }) {
  const { currentUser, userData, loadingAuth } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState(''); // 'borrower' or 'lender'
  const [creditScore, setCreditScore] = useState('');
  // UID, email, and createdAt will be displayed from currentUser or userData directly

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setRole(userData.role || 'borrower'); // Default to 'borrower' if not set
      setCreditScore(userData.creditScore ? userData.creditScore.toString() : '');
    } else if (currentUser && !userData) {
      // Fallback if userData is still loading or missing, but currentUser exists
      setDisplayName(currentUser.displayName || '');
      setRole('borrower'); // Default role
    }
  }, [userData, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!currentUser) {
      setFormError("You must be logged in to update your profile.");
      return;
    }

    const parsedCreditScore = creditScore.trim() ? parseInt(creditScore) : null;

    if (!displayName.trim()) {
      setFormError("Display name cannot be empty.");
      return;
    }
    if (!['borrower', 'lender'].includes(role)) {
      setFormError("Please select a valid role (Borrower or Lender).");
      return;
    }
    if (parsedCreditScore !== null && (isNaN(parsedCreditScore) || parsedCreditScore < 300 || parsedCreditScore > 850)) {
      setFormError("If provided, credit score must be a number between 300 and 850.");
      return;
    }

    setIsSubmitting(true);
    try {
      const profileDataToUpdate = {
        displayName: displayName.trim(),
        role: role,
        // Only include creditScore if it's provided; otherwise, don't send it to keep existing value or allow clearing
        ...(creditScore.trim() && parsedCreditScore !== null && { creditScore: parsedCreditScore }),
        // If you want to allow clearing credit score by submitting an empty string:
        // creditScore: parsedCreditScore, 
      };

      await updateUserProfile(currentUser.uid, profileDataToUpdate);
      setFormSuccess("Profile updated successfully!");
      // AuthContext will re-fetch userData on next onAuthStateChanged event or if explicitly triggered.
      // For immediate UI update of userData in AuthContext, AuthContext would need a refresh function.
    } catch (err) {
      console.error("EditProfilePage: Error updating profile:", err);
      setFormError(err.message || "Failed to update profile. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (loadingAuth && !userData) { // Show loading if auth is loading AND we don't have userData yet
    return <LoadingSpinner text="Loading user data..." />;
  }

  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <p className="text-textLight text-lg">Please log in to edit your profile.</p>
        <Button onClick={() => setCurrentPage(PAGES.LOGIN)} variant="primary" className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-textDark">Edit Your Profile</h1>
        <p className="text-textLight mt-2">
          Keep your information up to date.
        </p>
      </header>

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-palette-light-blue">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="uid"
            label="User ID (UID)"
            type="text"
            value={currentUser.uid || ''}
            disabled
            labelClassName="text-textDark"
            inputClassName="bg-gray-100 cursor-not-allowed text-textLight"
          />
          <InputField
            id="email"
            label="Email Address"
            type="email"
            value={currentUser.email || ''}
            disabled
            labelClassName="text-textDark"
            inputClassName="bg-gray-100 cursor-not-allowed text-textLight"
          />
          <InputField
            id="displayName"
            label="Display Name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name or nickname"
            required
            labelClassName="text-textDark"
            inputClassName="focus:ring-primary focus:border-primary"
          />
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-textDark mb-1">
              Primary Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-white text-textDark"
            >
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
            </select>
          </div>

          <InputField
            id="creditScore"
            label="Your Credit Score (Optional)"
            type="number"
            value={creditScore}
            onChange={(e) => setCreditScore(e.target.value)}
            placeholder="e.g., 720 (300-850)"
            min="300"
            max="850"
            labelClassName="text-textDark"
            inputClassName="focus:ring-primary focus:border-primary"
          />
          
          {userData?.createdAt && (
            <InputField
              id="createdAt"
              label="Profile Created On"
              type="text"
              value={formatDate(userData.createdAt)} // Assuming formatDate utility exists
              disabled
              labelClassName="text-textDark"
              inputClassName="bg-gray-100 cursor-not-allowed text-textLight"
            />
          )}

          {formError && <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md border border-red-300">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-700 bg-green-100 p-3 rounded-md border border-green-300">{formSuccess}</p>}

          <div className="pt-2 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage(PAGES.DASHBOARD)}
                className="w-full sm:w-auto text-textDark bg-palette-light-blue hover:bg-palette-light-blue/80 focus:ring-palette-medium-blue"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
                className="w-full sm:w-auto text-textDark bg-palette-light-blue hover:bg-palette-light-blue/80 focus:ring-palette-medium-blue"
            >
              {isSubmitting ? <LoadingSpinner text="Saving..." size="sm" color="white"/> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;

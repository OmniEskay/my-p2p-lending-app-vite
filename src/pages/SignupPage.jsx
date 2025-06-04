import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAGES } from '../config/constants';
import InputField from '../components/Common/InputField';
import Button from '../components/Common/Button';
import AuthPageLayout from '../components/Auth/AuthPageLayout'; // Assuming this component exists

function SignupPage({ setCurrentPage }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(email, password, displayName);
      setCurrentPage(PAGES.DASHBOARD); // Navigate to dashboard on successful signup
    } catch (err) {
      setError(err.message || 'Failed to create an account. Please try again.');
      console.error("Signup error:", err);
    }
    setLoading(false);
  };

  return (
    <AuthPageLayout
      title="Create your PeerLend Account"
      footerText="Already have an account?"
      footerLinkText="Log in here"
      onFooterLinkClick={() => setCurrentPage(PAGES.LOGIN)}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="displayName"
          label="Full Name / Display Name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          required
        />
        <InputField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          required
          autoComplete="new-password"
        />
        <InputField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          required
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
    </AuthPageLayout>
  );
}

export default SignupPage;

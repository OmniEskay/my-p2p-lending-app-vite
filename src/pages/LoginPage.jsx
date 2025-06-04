import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAGES, APP_NAME } from '../config/constants';
import InputField from '../components/Common/InputField';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// SVG Icons for social logins (simple examples)
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.4536 12.0002C19.4536 10.1495 20.6256 8.99877 20.7266 8.89779C19.6546 7.42093 18.0796 6.81704 17.0076 6.71605C15.3286 6.41309 13.7536 7.56382 12.9106 7.56382C12.0676 7.56382 10.8956 6.71605 9.42062 6.71605C7.74162 6.71605 6.16662 7.42093 5.09462 8.79681C3.51962 10.8957 3.21662 13.9016 4.58962 16.3945C5.32762 17.7704 6.39962 19.4494 7.87562 19.3484C9.25162 19.2474 9.65762 18.3997 11.3366 18.3997C12.9106 18.3997 13.3166 19.3484 14.7926 19.3484C16.2686 19.3484 17.1106 17.9684 17.8486 16.5925C18.5866 15.3175 18.8896 14.1668 18.8896 14.0658C18.8896 14.0658 19.4536 13.7629 19.4536 12.0002ZM15.8026 5.30124C16.4396 4.45351 16.8456 3.30278 16.7446 2.15205C15.7006 2.25303 14.6566 2.9579 13.9186 3.80563C13.3826 4.55238 12.8756 5.70311 13.0776 6.85384C14.1216 6.95482 15.1656 6.14897 15.8026 5.30124Z"/>
  </svg>
);

function LoginPage({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For email/password login
  const [socialLoading, setSocialLoading] = useState({ google: false, apple: false }); // For social logins
  const { login, signInWithGoogle, signInWithApple } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setCurrentPage(PAGES.DASHBOARD); // AuthContext will handle profile creation/fetching
    } catch (err) {
      let errorMessage = 'Failed to log in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
      }
      setError(errorMessage);
      console.error("Login error:", err, err.code);
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    setError(''); // Clear previous errors
    setSocialLoading(prev => ({ ...prev, [provider]: true }));
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'apple') {
        await signInWithApple();
      }
      // onAuthStateChanged in AuthContext will handle navigation to dashboard
      // and user profile creation/fetching via handleSocialSignIn helper.
    } catch (err) {
      console.error(`Error with ${provider} sign-in:`, err);
      setError(err.message || `Failed to sign in with ${provider}. Please try again.`);
    }
    setSocialLoading(prev => ({ ...prev, [provider]: false }));
  };

  return (
    <div className="min-h-screen bg-palette-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
            <h1 className="mt-6 text-4xl font-extrabold text-textDark tracking-tight">
            {APP_NAME}
            </h1>
            <p className="mt-2 text-center text-sm text-textLight">
            Welcome back! Please sign in to your account.
            </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10 border border-palette-light-blue">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              labelClassName="text-textDark"
              inputClassName="focus:ring-primary focus:border-primary" // Ensure input focus uses primary color
            />
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              labelClassName="text-textDark"
              inputClassName="focus:ring-primary focus:border-primary"
            />

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline">
                  Forgot your password?
                </a>
            </div>

            <div>
              <Button 
                type="submit" 
                fullWidth 
                disabled={loading || socialLoading.google || socialLoading.apple} 
                className="flex justify-center py-2.5 bg-primary hover:bg-primary-dark text-white focus:ring-primary focus:ring-offset-2 transition-colors duration-150"
              >
                {loading ? <LoadingSpinner text="" size="sm" color="white" /> : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-palette-light-blue" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-textLight font-medium"> Or continue with </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading || socialLoading.google || socialLoading.apple}
                fullWidth
                className="flex items-center justify-center py-2.5 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-textDark hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors duration-150"
              >
                {socialLoading.google ? <LoadingSpinner size="sm" text="" /> : <><GoogleIcon /> Sign in with Google</>}
              </Button>

              <Button 
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={loading || socialLoading.apple || socialLoading.google}
                fullWidth
                className="flex items-center justify-center py-2.5 border border-transparent rounded-md shadow-sm bg-textDark text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-150"
              >
                 {socialLoading.apple ? <LoadingSpinner size="sm" text="" color="white"/> : <><AppleIcon /> Sign in with Apple</>}
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-textLight">
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentPage(PAGES.SIGNUP)}
                  className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

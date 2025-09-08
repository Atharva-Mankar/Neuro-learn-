import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { demoAuth } from '../utils/demoAuth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isResetComplete, setIsResetComplete] = useState(false);

  useEffect(() => {
    // Get token from URL parameters
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setMessage({ 
        type: 'error', 
        text: 'Invalid or missing reset token. Please request a new password reset.' 
      });
    }
  }, [searchParams]);

  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return false;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset token' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await demoAuth.demoResetPassword(token, newPassword);
      
      if (result.success) {
        setIsResetComplete(true);
        setMessage({ 
          type: 'success', 
          text: 'Password successfully updated! You can now login with your new password.' 
        });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background wave patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        {/* Header section */}
        <div className="bg-gradient-to-r from-blue-800 to-purple-800 rounded-t-2xl p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">NeuroLearn</h1>
          <p className="text-blue-100">Reset Your Password</p>
        </div>

        {/* Form section */}
        <div className="bg-white rounded-b-2xl p-6 shadow-2xl">
          {!isResetComplete ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Create New Password
                </h2>
                <p className="text-gray-600">
                  Enter your new password below
                </p>
              </div>

              {/* Message display */}
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your new password"
                    required
                    disabled={loading || !token}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your new password"
                    required
                    disabled={loading || !token}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg ${
                    loading || !token ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Password Updated!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully updated. You can now login with your new password.
                </p>

                {message.text && (
                  <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-200">
                    {message.text}
                  </div>
                )}
              </div>

              <button
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Go to Login
              </button>
            </>
          )}

          {/* Back to login link */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              ← Back to Login
            </Link>
          </div>

          {/* Demo notice */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              <strong>Demo Mode:</strong> This is a demo password reset functionality. 
              In production, this would be secured with proper email verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
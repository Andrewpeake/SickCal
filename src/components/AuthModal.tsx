import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], isValid: false });

  const { signIn, signUp, resetPassword } = useAuth();

  // Password strength validation
  const validatePassword = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('At least 8 characters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('At least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('At least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('At least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      feedback.push('At least one special character');
    } else {
      score += 1;
    }

    return {
      score,
      feedback,
      isValid: score >= 4 && password.length >= 8
    };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate password strength for signup
    if (mode === 'signup' && !passwordStrength.isValid) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    // Validate display name for signup
    if (mode === 'signup' && (!displayName || displayName.trim().length < 2)) {
      setError('Display name must be at least 2 characters');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Failed to sign in. Please check your credentials.');
        } else {
          setMessage('Successfully signed in!');
          setTimeout(() => onClose(), 1000);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        
        if (error) {
          if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
            setError('An account with this email already exists. Try signing in instead.');
          } else {
            setError(error.message || 'Failed to create account. Please try again.');
          }
        } else {
          setMessage('Account created successfully! Please check your email for a confirmation link to complete your registration.');
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message || 'Failed to send reset email. Please try again.');
        } else {
          setMessage('Password reset email sent! Please check your inbox and follow the instructions.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setMessage('');
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            {mode === 'signup' && (
              <p className="text-sm text-gray-600 mt-1">
                Join SickCal to sync your calendar across all devices
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  displayName && displayName.trim().length < 2
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your display name"
                required
                minLength={2}
              />
              {displayName && displayName.trim().length < 2 && (
                <p className="text-xs text-red-600 mt-1">Display name must be at least 2 characters</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
                {mode === 'signup' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  mode === 'signup' && password && !passwordStrength.isValid
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                required
                minLength={mode === 'signup' ? 8 : 6}
              />
              
              {/* Password Strength Indicator for Signup */}
              {mode === 'signup' && password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-8 rounded ${
                            level <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? 'bg-red-400'
                                : passwordStrength.score <= 3
                                ? 'bg-yellow-400'
                                : 'bg-green-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-600' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.score <= 2 ? 'Weak' :
                       passwordStrength.score <= 3 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="text-xs text-gray-600">
                    <div className="grid grid-cols-1 gap-1">
                      {passwordStrength.feedback.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className={passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}>
                            {passwordStrength.isValid ? '✓' : '✗'}
                          </span>
                          <span>{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !passwordStrength.isValid)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {mode === 'signin' && 'Signing In...'}
                {mode === 'signup' && 'Creating Account...'}
                {mode === 'reset' && 'Sending Email...'}
              </div>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </button>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your password?{' '}
                <button
                  onClick={() => switchMode('reset')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset password
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!resetToken) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [resetToken]);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post(`/auth/reset-password/${resetToken}`, {
        password: data.password
      });

      if (response.data.success) {
        setSuccess(true);

        // Auto-login the user with the new token
        if (response.data.token && response.data.user) {
          login(response.data.token, response.data.user);

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {success ? (
            // Success Message
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Password Reset Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You're being logged in...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            </div>
          ) : error && !resetToken ? (
            // Invalid Token Error
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Reset Link
              </h3>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired.
                Please request a new password reset.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-red-600 hover:text-red-800 underline mt-2 inline-block"
                  >
                    Request a new reset link
                  </Link>
                </div>
              )}

              {/* Form */}
              <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />

              {/* Additional Links */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Back to Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

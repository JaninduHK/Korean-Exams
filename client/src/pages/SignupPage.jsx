import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle } from 'lucide-react';
import SignupForm from '../components/auth/SignupForm';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, error, clearError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await register(userData);
    if (result.success) {
      toast.success('Account created successfully! Welcome to EPS-TOPIK!');
      navigate('/dashboard', { replace: true });
    }
  };

  const benefits = [
    'Access to 500+ practice questions',
    'Reading and listening sections',
    'Detailed performance analytics',
    'Track your progress over time',
    'Study anytime, anywhere'
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 gradient-korean opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <h3 className="text-3xl font-bold mb-4">Start Your Journey to Korea</h3>
            <p className="text-lg mb-8 text-white/80">
              Join thousands of Sri Lankan students preparing for the EPS-TOPIK exam.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-xl">
              <p className="text-sm text-white/80 mb-2">Premium access included</p>
              <p className="text-2xl font-bold">Free for limited time!</p>
              <p className="text-sm text-white/80 mt-2">
                Sign up now and get full access to all features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <img src="/logo.png" alt="Korean Exams" className="h-12" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Start practicing for your Korean proficiency exam today
          </p>

          <div className="mt-8">
            <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

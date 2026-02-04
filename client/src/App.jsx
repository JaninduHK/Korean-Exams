import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Loader from './components/common/Loader';

// Critical pages - load immediately
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Non-critical pages - lazy load
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Admin Pages - lazy load
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions'));
const AdminExams = lazy(() => import('./pages/admin/AdminExams'));
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));

function App() {
  const { initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Hide navbar on exam page, auth pages, and admin pages
  const hideNavbar = ['/login', '/signup', '/forgot-password'].includes(location.pathname) ||
                     location.pathname.startsWith('/exam/') ||
                     location.pathname.startsWith('/admin') ||
                     location.pathname.startsWith('/reset-password/');

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}

      <Suspense fallback={<Loader />}>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<SubscriptionPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <PrivateRoute>
              <ExamListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/exam/:examId"
          element={
            <PrivateRoute>
              <ExamPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/results/:attemptId"
          element={
            <PrivateRoute>
              <ResultsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <PrivateRoute>
              <SubscriptionPage />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <AdminRoute>
              <AdminQuestions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <AdminRoute>
              <AdminExams />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <AdminRoute>
              <AdminPlans />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </div>
  );
}

export default App;

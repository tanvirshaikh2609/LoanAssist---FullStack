import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Loader2 } from 'lucide-react';

import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/layout/Navbar';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import LoanEligibilityPage from '../pages/LoanEligibilityPage';
import CompareLoansPage from '../pages/CompareLoansPage';
import CreditCardPage from '../pages/CreditCardPage';
import EMICalculatorPage from '../pages/EMICalculatorPage';
import ProfilePage from '../pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { accessToken, isInitializing } = useAuthStore();
  
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<><Navbar /><LandingPage /></>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="loan" element={<LoanEligibilityPage />} />
        <Route path="compare-loans" element={<CompareLoansPage />} />
        <Route path="cards" element={<CreditCardPage />} />
        <Route path="emi-calculator" element={<EMICalculatorPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

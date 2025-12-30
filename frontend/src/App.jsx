import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import UserRegistration from './pages/UserRegistration';
import AIportal from './pages/AIportal';
import LoanApplication from './pages/LoanApplication';
import MobileMoneyPayment from './pages/MobileMoneyPayment';
import SianAdminDashboard from './pages/admin/SianAdminDashboard';
import GLDMFAdminDashboard from './pages/admin/GLDMFAdminDashboard';
import Users from './pages/admin/Users';
import APIManagement from './pages/admin/APIManagement';
import SecurityCenter from './pages/admin/SecurityCenter';
import InvestmentPlatform from './pages/InvestmentPlatform';
import InvestmentProcess from './pages/gldmf/InvestmentProcess';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import ClientPortal from './pages/ClientPortal';
import { USER_ROLES } from './utils/authRoles';
import './index.css';

// Import new operational components
import GLDMFLoans from './pages/admin/gldmf/GLDMFLoans';
import GLDMFInvestments from './pages/admin/gldmf/GLDMFInvestments';
import GLDMFUsers from './pages/admin/gldmf/GLDMFUsers';
import SianSystem from './pages/admin/sian/SianSystem';
import SianAnalytics from './pages/admin/sian/SianAnalytics';

// NEW: Import detailed management components
import MembersManagement from './pages/admin/gldmf/MembersManagement';
import LoansManagement from './pages/admin/gldmf/LoansManagement';
import LoanDetails from './pages/admin/gldmf/LoanDetails';
import UserDetails from './pages/admin/gldmf/UserDetails';

// CORRECTED: WalletFunding import path - updated from sianfintech to sian
import WalletFunding from './pages/sian/WalletFunding';

// Simple Unauthorized Page Component
const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
      <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Return to Home
      </a>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Only show header if user is logged in AND not on home page */}
      {(user && user.role !== 'public' && window.location.pathname !== '/') && (
        <header className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">
              {user.tenantCode === 'gldmf' ? 'GLDMF Portal - Great Lakes Development Microfinance' : 
               user.tenantCode === 'sianfintech' ? 'SianFinTech Platform' : 'SianFinTech Platform'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Welcome, {user.name} ({user.role})
                {user.tenantCode && ` - ${user.tenantCode.toUpperCase()}`}
              </span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Development mode banner - only show for staff AND not on home page */}
      {(user && [USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF, USER_ROLES.TENANT_ADMIN].includes(user.role) && window.location.pathname !== '/') && (
        <div className="fixed top-4 right-4 z-50">
          <div className="px-3 py-2 rounded-full text-white text-sm font-medium shadow-lg flex items-center space-x-2 bg-yellow-500">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Development Mode</span>
          </div>
        </div>
      )}

      <main className={user && user.role !== 'public' ? '' : ''}>
        <Routes>
          {/* PUBLIC ROUTES - Always accessible, no redirects */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/investment-platform" element={<InvestmentPlatform />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* AUTHENTICATION ROUTES */}
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/member-login" element={<Login />} />
          <Route path="/gldmf-login" element={<Login />} />
          <Route path="/sian-login" element={<Login />} />
          
          {/* MEMBER PORTAL ROUTES */}
          <Route 
            path="/member/dashboard" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <ClientPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/member/portfolio" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <ClientPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/member/apply-financing" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <LoanApplication />
              </ProtectedRoute>
            } 
          />
          
          {/* SIAN ADMIN ROUTES */}
          <Route 
            path="/admin/sian" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF]}>
                <SianAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sian/users" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN]}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sian/api" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN]}>
                <APIManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sian/security" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN]}>
                <SecurityCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sian/system" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN]}>
                <SianSystem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sian/analytics" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF]}>
                <SianAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sian/tenants" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN]}>
                <SianAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* GLDMF ADMIN ROUTES */}
          <Route 
            path="/admin/gldmf" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <GLDMFAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/members" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <MembersManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/loans" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <LoansManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/loans/:loanId" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <LoanDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/users/:userId" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <UserDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/investments" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <GLDMFInvestments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/users" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN]}>
                <GLDMFUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/gldmf/reports" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <GLDMFAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* STAFF PORTAL ROUTES */}
          <Route 
            path="/gldmf/dashboard" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <GLDMFAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gldmf/ai-scoring" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <AIportal />
              </ProtectedRoute>
            } 
          />
          
          {/* SIAN STAFF ROUTES */}
          <Route 
            path="/sian/dashboard" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF]}>
                <SianAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sian/ai-scoring" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF]}>
                <AIportal />
              </ProtectedRoute>
            } 
          />

          {/* AI PORTAL */}
          <Route 
            path="/ai-portal" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF, USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <AIportal />
              </ProtectedRoute>
            } 
          />
          
          {/* INVESTMENT EXECUTION ROUTES */}
          <Route 
            path="/gldmf/investment-process" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <InvestmentProcess />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sianfintech/wallet-funding" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <WalletFunding />
              </ProtectedRoute>
            } 
          />
          
          {/* LEGACY ROUTES - Clean up these eventually */}
          <Route 
            path="/client-portal" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <ClientPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <GLDMFAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/adminDashboard" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF]}>
                <GLDMFAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF]}>
                <SianAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/loan-application" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                <LoanApplication />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mobile-money" 
            element={
              <ProtectedRoute requiredRoles={[USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF, USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF, USER_ROLES.MEMBER]}>
                <MobileMoneyPayment />
              </ProtectedRoute>
            } 
          />
          
          {/* CATCH ALL - Important: This should be the LAST route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
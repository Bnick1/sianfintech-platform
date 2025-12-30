import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../utils/authRoles';

const Login = () => {
  // Member login state
  const [memberNumber, setMemberNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  
  // Staff login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('member');
  const { login, memberLogin, user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('🎯 Login Component - Current user:', user, 'Loading:', loading);

  // Fixed: Only redirect if user JUST logged in (not from existing session)
  useEffect(() => {
    console.log('🎯 Login Component - Current user:', user, 'Loading:', loading);
    
    // Only redirect if user JUST logged in (not from existing session)
    // This prevents automatic redirects for already logged-in users
    if (user && user.role !== 'public' && !loading) {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn) {
        console.log('🎯 User just logged in, redirecting based on role:', user.role);
        sessionStorage.removeItem('justLoggedIn');
        redirectBasedOnRole(user.role);
      }
      // If not just logged in, do nothing - let user stay on login page
    }
  }, [user, loading, navigate]);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const redirectBasedOnRole = (role) => {
    switch(role) {
      case USER_ROLES.MEMBER:
        navigate('/member/dashboard', { replace: true });
        break;
      case USER_ROLES.TENANT_ADMIN:
      case USER_ROLES.TENANT_STAFF:
        navigate('/gldmf/dashboard', { replace: true });
        break;
      case USER_ROLES.SIAN_ADMIN:
      case USER_ROLES.SIAN_STAFF:
        navigate('/sian/dashboard', { replace: true });
        break;
      default:
        navigate('/member/dashboard', { replace: true });
    }
  };

  // NEW: Auto-fill exact demo credentials
  const fillDemoCredentials = () => {
    setError('');
    
    switch(selectedUserType) {
      case 'member':
        setMemberNumber('69001289');
        setPhoneNumber('+256700000001');
        setOtp('123456');
        if (!otpSent) {
          setOtpSent(true);
        }
        break;
      case 'tenant_staff':
        setEmail('admin@gldmf.com');
        setPassword('staff123');
        break;
      case 'sian_staff':
        setEmail('admin@sianfintech.com');
        setPassword('sian123');
        break;
    }
  };

  const sendOTP = async () => {
    if (!memberNumber || !phoneNumber) {
      setError('Please enter member number and phone number');
      return;
    }

    try {
      setError('');
      // Simulate OTP sending
      setOtpSent(true);
      setOtpCooldown(60); // 60 seconds cooldown
      setOtp('123456'); // Auto-fill for demo
      
      console.log('📱 OTP sent to:', phoneNumber);
    } catch (error) {
      setError('Failed to send verification code');
    }
  };

  const handleMemberLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!memberNumber || !phoneNumber) {
      setError('Please enter member number and phone number');
      return;
    }

    if (!otpSent) {
      setError('Please request verification code first');
      return;
    }

    if (!otp) {
      setError('Please enter verification code');
      return;
    }

    console.log('🎯 Member login submitted');
    setIsLoading(true);
    
    try {
      const result = await memberLogin(memberNumber, phoneNumber, otp);
      console.log('🎯 Member login completed, result:', result);
      
      if (result.success) {
        // ✅ Set flag to indicate user JUST logged in
        sessionStorage.setItem('justLoggedIn', 'true');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('🎯 Member login error:', error);
      setError('Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    console.log('🎯 Staff login submitted');
    setIsLoading(true);
    
    try {
      const result = await login(email, password, selectedUserType);
      console.log('🎯 Staff login completed, result:', result);
      
      if (result.success) {
        // ✅ Set flag to indicate user JUST logged in
        sessionStorage.setItem('justLoggedIn', 'true');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('🎯 Staff login error:', error);
      setError('Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (selectedUserType === 'member') {
      handleMemberLogin(e);
    } else {
      handleStaffLogin(e);
    }
  };

  const getLoginTitle = () => {
    switch(selectedUserType) {
      case 'member':
        return 'Member Login';
      case 'tenant_staff':
        return 'GLDMF Staff Login';
      case 'sian_staff':
        return 'Sian Staff Login';
      default:
        return 'Sign in to your account';
    }
  };

  const getDemoCredentials = () => {
    switch(selectedUserType) {
      case 'member':
        return {
          title: 'GLDMF Member Demo',
          instructions: 'Member: 69001289, Phone: +256700000001, OTP: 123456',
          buttonText: 'Use Member Demo'
        };
      case 'tenant_staff':
        return {
          title: 'GLDMF Staff Accounts',
          accounts: [
            'admin@gldmf.com / staff123',
            'loanofficer@gldmf.com / staff123',
            'manager@gldmf.com / staff123'
          ],
          buttonText: 'Use GLDMF Staff Demo'
        };
      case 'sian_staff':
        return {
          title: 'Sian Staff Accounts',
          accounts: [
            'admin@sianfintech.com / sian123',
            'analyst@sianfintech.com / sian123',
            'support@sianfintech.com / sian123'
          ],
          buttonText: 'Use Sian Staff Demo'
        };
      default:
        return { title: '', accounts: [], buttonText: 'Use Demo' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const demoCredentials = getDemoCredentials();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getLoginTitle()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          SianFinTech Platform - Africa's Informal Economy OS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Access */}
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2 text-center">
            Quick Demo Access
          </h3>
          <button
            onClick={fillDemoCredentials}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${
              selectedUserType === 'member' ? 'bg-blue-600 hover:bg-blue-700' :
              selectedUserType === 'tenant_staff' ? 'bg-green-600 hover:bg-green-700' :
              'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {demoCredentials.buttonText}
          </button>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Login As</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedUserType('member');
                  setError('');
                  setOtpSent(false);
                }}
                className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                  selectedUserType === 'member'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserType('tenant_staff');
                  setError('');
                }}
                className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                  selectedUserType === 'tenant_staff'
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                GLDMF Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserType('sian_staff');
                  setError('');
                }}
                className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                  selectedUserType === 'sian_staff'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sian Staff
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {selectedUserType === 'member' ? (
              // Member Login Form
              <>
                <div>
                  <label htmlFor="memberNumber" className="block text-sm font-medium text-gray-700">
                    Member Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="memberNumber"
                      name="memberNumber"
                      type="text"
                      required
                      value={memberNumber}
                      onChange={(e) => setMemberNumber(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="Enter your GLDMF member number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="+256700000001"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    SMS Verification Code
                  </label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={otpCooldown > 0 || !memberNumber || !phoneNumber}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap transition-colors min-w-[100px]"
                    >
                      {otpCooldown > 0 ? `${otpCooldown}s` : 'Send Code'}
                    </button>
                  </div>
                  {otpSent && !otp && (
                    <p className="mt-1 text-sm text-green-600">Verification code sent to your phone</p>
                  )}
                </div>
              </>
            ) : (
              // Staff Login Form
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  selectedUserType === 'member' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                  selectedUserType === 'tenant_staff' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                  'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{demoCredentials.title}</p>
                {demoCredentials.instructions ? (
                  <p className="text-xs text-gray-500 mt-1">{demoCredentials.instructions}</p>
                ) : (
                  demoCredentials.accounts?.map((account, index) => (
                    <p key={index} className="text-xs text-gray-500 mt-1">{account}</p>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-500 text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
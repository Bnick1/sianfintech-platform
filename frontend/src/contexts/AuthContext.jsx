import React, { createContext, useState, useContext, useEffect } from 'react';
import { USER_ROLES } from '../utils/authRoles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: Checking for existing session');
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('✅ AuthContext: Found existing user:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ AuthContext: Error parsing saved user:', error);
        logout();
      }
    } else {
      console.log('ℹ️ AuthContext: No existing session found');
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password, userType = 'member') => {
    try {
      console.log('🔐 AuthContext: Staff login attempt:', { email, userType });
      
      const result = await fallbackStaffLogin(email, password, userType);
      console.log('🔐 AuthContext: Staff login result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ AuthContext: Staff login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const memberLogin = async (memberNumber, phoneNumber, otp) => {
    try {
      console.log('🔐 AuthContext: Member login attempt:', { memberNumber, phoneNumber });
      
      const result = await fallbackMemberLogin(memberNumber, phoneNumber, otp);
      console.log('🔐 AuthContext: Member login result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ AuthContext: Member login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const fallbackMemberLogin = async (memberNumber, phoneNumber, otp) => {
    try {
      console.log('🔐 AuthContext: Checking member login for:', { memberNumber, phoneNumber });
      
      // Verify OTP (demo mode - always accept 123456)
      if (otp !== '123456') {
        return { success: false, error: 'Invalid verification code' };
      }

      // Simulate API call to verify member
      const response = await fetch('http://localhost:8082/api/auth/member-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberNumber,
          phoneNumber,
          otp
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ AuthContext: Member login successful');
          setUser(result.user);
          localStorage.setItem('authToken', 'member-token-' + Date.now());
          localStorage.setItem('user', JSON.stringify(result.user));
          return { success: true, user: result.user };
        } else {
          return { success: false, error: result.error || 'Member not found' };
        }
      } else {
        // Fallback to demo member data if backend fails
        return handleDemoMemberLogin(memberNumber, phoneNumber);
      }
    } catch (error) {
      console.log('🔐 AuthContext: Backend unavailable, using demo member data');
      return handleDemoMemberLogin(memberNumber, phoneNumber);
    }
  };

  const handleDemoMemberLogin = (memberNumber, phoneNumber) => {
    // Demo member data - in production, this would come from your GLDMF database
    const demoMembers = [
      {
        memberNumber: '69001289',
        phoneNumber: '+256700000001',
        name: 'John Farmer',
        role: USER_ROLES.MEMBER,
        tenantCode: 'gldmf',
        occupation: 'farmer',
        memberSince: '2023-01-15'
      },
      {
        memberNumber: '69001290', 
        phoneNumber: '+256700000002',
        name: 'Sarah Vendor',
        role: USER_ROLES.MEMBER,
        tenantCode: 'gldmf',
        occupation: 'market_vendor',
        memberSince: '2023-02-20'
      },
      {
        memberNumber: '69001291',
        phoneNumber: '+256700000003',
        name: 'Mike Driver',
        role: USER_ROLES.MEMBER,
        tenantCode: 'gldmf',
        occupation: 'taxi_driver',
        memberSince: '2023-03-10'
      }
    ];

    const validMember = demoMembers.find(member => 
      member.memberNumber === memberNumber && member.phoneNumber === phoneNumber
    );

    if (validMember) {
      const userData = {
        id: 'member-' + validMember.memberNumber,
        name: validMember.name,
        role: validMember.role,
        memberNumber: validMember.memberNumber,
        phoneNumber: validMember.phoneNumber,
        tenantCode: validMember.tenantCode,
        occupation: validMember.occupation,
        memberSince: validMember.memberSince
      };
      
      console.log('✅ AuthContext: Demo member login successful');
      setUser(userData);
      localStorage.setItem('authToken', 'demo-member-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } else {
      console.log('❌ AuthContext: No matching member found');
      return { success: false, error: 'Member not found. Please check your member number and phone number.' };
    }
  };

  const fallbackStaffLogin = async (email, password, userType = 'member') => {
    try {
      console.log('🔐 AuthContext: Checking staff accounts for:', email);
      
      const sianStaffAccounts = [
        { 
          email: 'admin@sianfintech.com', 
          password: 'sian123', 
          role: USER_ROLES.SIAN_ADMIN, 
          name: 'SianFinTech Super Admin',
          tenantCode: 'sianfintech'
        },
        { 
          email: 'analyst@sianfintech.com', 
          password: 'sian123', 
          role: USER_ROLES.SIAN_STAFF, 
          name: 'SianFinTech Analyst',
          tenantCode: 'sianfintech'
        },
        { 
          email: 'support@sianfintech.com', 
          password: 'sian123', 
          role: USER_ROLES.SIAN_STAFF, 
          name: 'SianFinTech Support',
          tenantCode: 'sianfintech'
        }
      ];

      const gldmfStaffAccounts = [
        { 
          email: 'admin@gldmf.com', 
          password: 'staff123', 
          role: USER_ROLES.TENANT_ADMIN, 
          name: 'GLDMF Admin',
          tenantCode: 'gldmf'
        },
        { 
          email: 'loanofficer@gldmf.com', 
          password: 'staff123', 
          role: USER_ROLES.TENANT_STAFF, 
          name: 'GLDMF Loan Officer',
          tenantCode: 'gldmf'
        },
        { 
          email: 'manager@gldmf.com', 
          password: 'staff123', 
          role: USER_ROLES.TENANT_STAFF, 
          name: 'GLDMF Manager',
          tenantCode: 'gldmf'
        }
      ];

      let validUser;

      if (userType === 'sian_staff') {
        validUser = sianStaffAccounts.find(cred => 
          cred.email === email && cred.password === password
        );
      } else if (userType === 'tenant_staff') {
        validUser = gldmfStaffAccounts.find(cred => 
          cred.email === email && cred.password === password
        );
      } else {
        // Default to searching all staff accounts
        validUser = [...sianStaffAccounts, ...gldmfStaffAccounts].find(cred => 
          cred.email === email && cred.password === password
        );
      }

      console.log('🔐 AuthContext: Staff login check - found:', validUser);

      if (validUser) {
        const userData = {
          name: validUser.name,
          email: validUser.email,
          role: validUser.role,
          tenantCode: validUser.tenantCode
        };
        
        console.log('✅ AuthContext: Setting staff user state and localStorage');
        setUser(userData);
        localStorage.setItem('authToken', 'staff-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        console.log('❌ AuthContext: No matching staff user found');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('❌ AuthContext: Fallback staff login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out');
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Force complete reset of the application
    window.location.href = '/';
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const publicUser = { role: 'public' };

  const value = {
    user: user || publicUser,
    login,
    memberLogin,
    logout,
    loading,
    isAuthenticated: !!user && user.role !== 'public',
    isStaff: user && [USER_ROLES.SIAN_ADMIN, USER_ROLES.SIAN_STAFF, USER_ROLES.TENANT_ADMIN, USER_ROLES.TENANT_STAFF].includes(user.role),
    isMember: user && user.role === USER_ROLES.MEMBER
  };

  console.log('🔄 AuthContext: Providing value:', { 
    user: value.user, 
    isAuthenticated: value.isAuthenticated,
    loading: value.loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
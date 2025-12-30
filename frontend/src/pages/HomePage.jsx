import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SianFinTech</h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium">Services</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.name}
                  </span>
                  <button 
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Logout
                  </button>
                  {user.role === 'member' && (
                    <Link 
                      to="/member/dashboard"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Member Portal
                    </Link>
                  )}
                  {(user.role === 'tenant_admin' || user.role === 'tenant_staff') && (
                    <Link 
                      to="/admin/gldmf"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      GLDMF Admin
                    </Link>
                  )}
                  {(user.role === 'sian_admin' || user.role === 'sian_staff') && (
                    <Link 
                      to="/admin/sian"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Sian Admin
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SianFinTech
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Empowering Africa's informal sector with 
            climate-smart financing, and innovative insurance off-line first edge solutions.
          </p>
          
          {/* Login Prompts Section - Only show when not authenticated */}
          {!isAuthenticated && (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Your Portal</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Member Login */}
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">F</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Farmers & Members</h3>
                  <p className="text-sm text-gray-600 mb-4">Access financing, insurance, and investment opportunities</p>
                  <Link 
                    to="/member-login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium inline-block"
                  >
                    Member Login
                  </Link>
                </div>

                {/* GLDMF Staff Login */}
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">G</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">GLDMF Staff</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage members, loans, and microfinance operations</p>
                  <Link 
                    to="/gldmf-login"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium inline-block"
                  >
                    Staff Login
                  </Link>
                </div>

                {/* SianFinTech Staff Login */}
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">SianFinTech Team</h3>
                  <p className="text-sm text-gray-600 mb-4">Platform administration and global operations</p>
                  <Link 
                    to="/sian-login"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium inline-block"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action for non-authenticated users */}
          {!isAuthenticated && (
            <div className="flex justify-center space-x-4">
              <Link 
                to="/investment-platform"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Explore Investments
              </Link>
              <Link 
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Empowering Africa's Informal Economy Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Empowering Africa's Informal Sector
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Farmers */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🌱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Farmers</h3>
              <p className="text-sm text-gray-600">Climate-smart financing & insurance</p>
            </div>

            {/* Transport */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🏍️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transport</h3>
              <p className="text-sm text-gray-600">Boda bodas, taxi operators, drivers</p>
            </div>

            {/* Traders */}
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-2xl">🏪</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Traders</h3>
              <p className="text-sm text-gray-600">Market vendors, small businesses</p>
            </div>

            {/* Gig Workers */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gig Workers</h3>
              <p className="text-sm text-gray-600">Freelancers, service providers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Insights & Financial News Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Market Insights & Financial News
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Latest Financial News</h3>
            
            <div className="space-y-6">
              {/* News Item 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Climate-Smart Agriculture Gains Momentum in East Africa
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  New financing models are helping smallholder farmers adopt sustainable practices while increasing yields.
                </p>
                <span className="text-xs text-blue-600">2 hours ago</span>
              </div>

              {/* News Item 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Digital Microfinance Revolutionizes Rural Banking
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Mobile-based financial services are expanding access to credit in previously underserved communities.
                </p>
                <span className="text-xs text-green-600">5 hours ago</span>
              </div>

              {/* News Item 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Gig Economy Workers Embrace Digital Insurance Products
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Flexible insurance plans tailored for freelancers and service providers see rapid adoption.
                </p>
                <span className="text-xs text-purple-600">1 day ago</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Stay Updated</h4>
                  <p className="text-sm text-gray-600">Get the latest market insights delivered to your inbox</p>
                </div>
                <div className="flex mt-4 md:mt-0">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">SianFinTech</h3>
              <p className="text-gray-400 text-sm mb-4">
                Enabling decentralized climate-smart investments for Africa's informal economy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/services" className="hover:text-white">Services</Link></li>
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform Access</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/member-login" className="hover:text-white">Member Portal</Link></li>
                <li><Link to="/gldmf-login" className="hover:text-white">GLDMF Staff</Link></li>
                <li><Link to="/sian-login" className="hover:text-white">SianFinTech Team</Link></li>
                <li><Link to="/investment-platform" className="hover:text-white">Investments</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-3">
                  <span className="text-white mt-0.5">📍</span>
                  <div>
                    <p className="font-medium text-white">Address</p>
                    <p>Level2 Master Plaza Building</p>
                    <p>Kampala, Uganda</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-white mt-0.5">📞</span>
                  <div>
                    <p className="font-medium text-white">Phone</p>
                    <p>+256 741 430 326</p>
                    <p>+256 773 442 268</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-white mt-0.5">✉️</span>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <p>info@sianfintech.com</p>
                    <p>support@sianfintech.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-white mt-0.5">🕒</span>
                  <div>
                    <p className="font-medium text-white">Business Hours</p>
                    <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                    <p>Sat: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SianTechnologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
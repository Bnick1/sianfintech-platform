// src/pages/Help.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-gray-600">Get assistance with SianFinTech platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Guides</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• How to register clients</li>
              <li>• Loan application process</li>
              <li>• Investment platform guide</li>
              <li>• Kiosk management</li>
              <li>• Mobile money payments</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Support</h3>
            <div className="space-y-3 text-gray-600">
              <p>📞 Phone: +256 700 123 456</p>
              <p>📧 Email: support@sianfintech.com</p>
              <p>🕒 Hours: Mon-Fri 8AM-6PM EAT</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/register" className="block text-blue-600 hover:text-blue-800">
                Client Registration
              </Link>
              <Link to="/loan-application" className="block text-blue-600 hover:text-blue-800">
                Apply for Loan
              </Link>
              <Link to="/kiosk-management" className="block text-blue-600 hover:text-blue-800">
                Kiosk Management
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Resources</h3>
            <div className="space-y-2">
              <Link to="/admin/users" className="block text-blue-600 hover:text-blue-800">
                User Management
              </Link>
              <Link to="/admin/settings" className="block text-blue-600 hover:text-blue-800">
                System Settings
              </Link>
              <Link to="/admin/audit-logs" className="block text-blue-600 hover:text-blue-800">
                Audit Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
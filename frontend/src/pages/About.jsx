import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              <span className="text-xl font-bold text-gray-800">SianFinTech</span>
            </Link>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link to="/services" className="text-gray-600 hover:text-blue-600">Services</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">About SianFinTech</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              SianFinTech bridges the gap between digital finance and sustainable agriculture by building a
              decentralized platform that connects microfinance institutions, cooperatives, and farmers to
              climate-smart funding.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We leverage AI and IoT-enabled risk intelligence to generate predictive credit scores,
              optimize resource allocation, and reduce default risks in agricultural lending—creating a
              secure and inclusive ecosystem for farmers, lenders, and investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become Africa's economic identity infrastructure, where every informal worker has a 
                digital economic footprint unlocking financial services, insurance protection, and 
                investment opportunities.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Values</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Innovation and Technology</li>
                <li>• Financial Inclusion</li>
                <li>• Transparency and Trust</li>
                <li>• Climate Resilience</li>
                <li>• Local Empowerment</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Platform Architecture</h2>
            <p className="text-gray-600 mb-4">
              SianFinTech is Africa's economic identity infrastructure, providing multi-tenant financial 
              services platform for institutions like GLDMF (Great Lakes Development Microfinance).
            </p>
            <p className="text-gray-600">
              Our platform transforms informal sector activity into bankable intelligence through AI-powered 
              economic identity graphs, enabling financial inclusion for the 80% of Africans operating in 
              the informal economy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
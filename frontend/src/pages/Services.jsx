import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      title: "Climate-Smart Agri-Loans",
      description: "Agricultural financing with climate risk assessment and resilience planning",
      features: ["Weather-indexed loans", "Crop insurance integration", "Climate adaptation support"],
      link: "/loan-application",
      icon: "🌾"
    },
    {
      title: "Green Investment Platform",
      description: "Climate-resilient investment opportunities in sustainable agriculture",
      features: ["Impact investing", "Carbon credit tracking", "Sustainable yield optimization"],
      link: "/investment-platform",
      icon: "💧"
    },
    {
      title: "AI Risk Intelligence",
      description: "Predictive credit scoring using climate data and IoT sensors",
      features: ["Weather pattern analysis", "Crop health monitoring", "Default risk prediction"],
      link: "/ai-portal",
      icon: "🤖"
    },
    {
      title: "Digital Farmer Wallets",
      description: "Offline-capable financial access for rural smallholder farmers",
      features: ["Low-connectivity design", "Mobile money integration", "Transaction analytics"],
      link: "/mobile-money",
      icon: "⚡"
    },
    {
      title: "Climate Data Analytics",
      description: "Real-time climate and agricultural data for informed decision making",
      features: ["Satellite imagery", "Soil health data", "Weather forecasting"],
      link: "/ai-portal",
      icon: "📊"
    },
    {
      title: "Farmer Portal",
      description: "Comprehensive management for agricultural clients and cooperatives",
      features: ["Loan management", "Weather alerts", "Market price tracking"],
      link: "/client-login",
      icon: "👨‍🌾"
    }
  ];

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
              <Link to="/about" className="text-gray-600 hover:text-blue-600">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Services</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Comprehensive climate-smart financial solutions designed for Africa's informal sector
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="mb-6 space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                to={service.link}
                className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
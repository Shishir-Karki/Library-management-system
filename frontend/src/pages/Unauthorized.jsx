import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 mt-10">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized; 
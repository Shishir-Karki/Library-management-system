import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MembershipApplications from './MembershipApplications';
import Members from './Members';
// Import other admin components as needed

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            Membership Applications
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
         
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'applications' && <MembershipApplications />}
        {activeTab === 'members' && <Members />}
      </div>
    </div>
  );
};

export default AdminDashboard; 
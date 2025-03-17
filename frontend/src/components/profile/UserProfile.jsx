import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        console.log("Fetching user profile...");
        const response = await axios.get('/api/users/profile', config);
        console.log("User profile data:", response.data);
        
        setUserProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.msg || 'Failed to load profile');
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h2>
        
        {userProfile && (
          <>
            {/* User Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-medium">Name:</span> 
                  <span className="ml-2">{userProfile.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Email:</span> 
                  <span className="ml-2">{userProfile.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Role:</span> 
                  <span className="ml-2 capitalize">{userProfile.role}</span>
                </div>
              </div>
            </div>
            
            {/* Membership Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Membership Details</h3>
              
              {userProfile.membership ? (
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-700 font-medium">Membership Number:</span> 
                      <span className="ml-2 font-mono">{userProfile.membership.membershipNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Type:</span> 
                      <span className="ml-2 capitalize">{userProfile.membership.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        userProfile.membership.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userProfile.membership.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Valid Until:</span> 
                      <span className="ml-2">
                        {new Date(userProfile.membership.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    {userProfile.membership.notes && (
                      <div>
                        <span className="text-gray-700 font-medium">Notes:</span> 
                        <p className="mt-1 text-sm bg-white p-2 rounded border border-gray-200">
                          {userProfile.membership.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600 mb-4">You don't have an active membership.</p>
                  <a 
                    href="/my-memberships" 
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Apply for Membership
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 
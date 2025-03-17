import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

const UserMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        console.log("Fetching user memberships...");
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Use the new endpoint
        const response = await axios.get('https://library-management-system-1-53kq.onrender.com/api/memberships/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Memberships data:", response.data);
        setMemberships(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching memberships:', err);
        setError(err.response?.data?.message || 'Failed to load memberships');
        toast.error('Failed to load memberships');
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Loading memberships...</span>
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
      <h2 className="text-2xl font-bold mb-6">My Memberships</h2>

      {memberships.length === 0 ? (
        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-md">
          <p className="text-yellow-700">You don't have any memberships yet.</p>
          <Link 
            to="/membership/apply" 
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Apply for Membership
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map(membership => (
            <div 
              key={membership._id} 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold mb-3">{membership.type} Membership</h3>
                <span 
                  className={`px-2 py-1 rounded text-sm ${
                    membership.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {membership.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">Membership #:</span> {membership.membershipNumber}</p>
                <p><span className="font-medium">Started:</span> {new Date(membership.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Valid Until:</span> {new Date(membership.validUntil).toLocaleDateString()}</p>
                
                {membership.notes && (
                  <div className="mt-3">
                    <p className="font-medium">Notes:</p>
                    <p className="text-gray-600 text-sm mt-1 bg-gray-50 p-2 rounded">{membership.notes}</p>
                  </div>
                )}
              </div>
              
              {membership.status === 'active' && (
                <div className="mt-4 pt-4 border-t">
                  <a 
                    href={`/membership/renew/${membership._id}`} 
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Renew Membership
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Make sure to export the component
export default UserMemberships; 
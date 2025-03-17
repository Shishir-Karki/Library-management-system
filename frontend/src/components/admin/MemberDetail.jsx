import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberDetails();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://library-management-system-1-53kq.onrender.com/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setMember(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching member details:', error);
      setError('Failed to load member details');
      toast.error('Failed to load member details');
      setLoading(false);
    }
  };

  const getMembershipStatusClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Loading member details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/admin')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={fetchMemberDetails} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Member not found</p>
        </div>
        <button 
          onClick={() => navigate('/admin')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Member Details</h2>
          <div className="flex space-x-2">
            <Link 
              to={`/admin/members/${id}/edit`} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Member
            </Link>
            <button 
              onClick={() => navigate('/admin')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
          </div>
        </div>
        
        {/* Member Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b">User Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-medium">Name:</p>
                  <p className="text-gray-900">{member.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Email:</p>
                  <p className="text-gray-900">{member.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Role:</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${member.isAdmin || member.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'}`}
                  >
                    {member.isAdmin || member.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Account Created:</p>
                  <p className="text-gray-900">{new Date(member.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Last Updated:</p>
                  <p className="text-gray-900">{new Date(member.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* Membership Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b">Membership Details</h3>
              {member.membership ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 font-medium">Membership Type:</p>
                    <p className="text-gray-900">{member.membership.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Membership Number:</p>
                    <p className="text-gray-900">{member.membership.membershipNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Status:</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${getMembershipStatusClass(member.membership.status)}`}
                    >
                      {member.membership.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Valid Until:</p>
                    <p className="text-gray-900">
                      {new Date(member.membership.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Membership Created:</p>
                    <p className="text-gray-900">
                      {new Date(member.membership.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {member.membership.notes && (
                    <div>
                      <p className="text-gray-600 font-medium">Notes:</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                        {member.membership.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600">This user has no active membership.</p>
                  <button 
                    className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    onClick={() => navigate(`/admin/members/${id}/add-membership`)}
                  >
                    Add Membership
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail; 
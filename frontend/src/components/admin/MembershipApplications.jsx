import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

const MembershipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [processingNotes, setProcessingNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentAction, setCurrentAction] = useState({ id: null, status: null });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }
      
      console.log('Fetching pending membership applications...');
      
      const response = await axios.get('https://library-management-system-1-53kq.onrender.com/api/admin/memberships/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Pending applications response:', response.data);
      
      if (Array.isArray(response.data)) {
        setApplications(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received invalid data format from server');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to load membership applications';
                          
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleActionClick = (id, status) => {
    setCurrentAction({ id, status });
    setProcessingNotes('');
    setShowNotesModal(true);
  };

  const processApplication = async (id, status) => {
    try {
      setProcessingId(id);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/admin/memberships/process/${id}`, 
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Process application response:', response.data);
      
      toast.success(`Application ${status === 'active' ? 'approved' : 'rejected'} successfully`);
      
      // Remove the processed application from the list
      setApplications(applications.filter(app => app._id !== id));
      
      setProcessingId(null);
      setShowNotesModal(false);
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error(error.response?.data?.message || 'Failed to process application');
      setProcessingId(null);
      setShowNotesModal(false);
    }
  };

  const NotesModal = () => {
    if (!showNotesModal) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">
            {currentAction.status === 'active' ? 'Approve' : 'Reject'} Membership
          </h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              className="w-full border rounded p-2"
              rows="3"
              value={processingNotes}
              onChange={(e) => setProcessingNotes(e.target.value)}
              placeholder={currentAction.status === 'active' 
                ? "Add any comments about this approval"
                : "Add reason for rejection"}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNotesModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => processApplication(currentAction.id, currentAction.status)}
              className={`px-4 py-2 text-white rounded ${
                currentAction.status === 'active' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p>{error}</p>
        <button 
          onClick={fetchApplications} 
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pending Membership Applications</h2>
        <button 
          onClick={fetchApplications}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {applications.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No pending membership applications</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map(application => (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.user?.name || 'User'}</div>
                    <div className="text-sm text-gray-500">{application.user?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {application.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleActionClick(application._id, 'active')}
                      className="text-green-600 hover:text-green-900 mr-4 font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleActionClick(application._id, 'rejected')}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <NotesModal />
    </div>
  );
};

export default MembershipApplications; 
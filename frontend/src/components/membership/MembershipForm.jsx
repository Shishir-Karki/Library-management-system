import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MembershipCard from './MembershipCard';

const MembershipForm = () => {
  const { isAdmin } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'standard',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchMemberships();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/memberships');
      setMemberships(response.data);
    } catch (error) {
      toast.error('Error fetching memberships');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/memberships', formData);
      toast.success('Membership created successfully');
      fetchMemberships();
      setFormData({
        userId: '',
        type: 'standard',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error creating membership');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (membershipId) => {
    if (!window.confirm('Are you sure you want to delete this membership?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/memberships/${membershipId}`);
      toast.success('Membership deleted successfully');
      fetchMemberships();
    } catch (error) {
      toast.error('Error deleting membership');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Create New Membership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">User</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Membership Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Membership'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberships.map(membership => (
          <MembershipCard
            key={membership._id}
            membership={membership}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MembershipForm;
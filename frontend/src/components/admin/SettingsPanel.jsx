import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

const SettingsPanel = () => {
  const [loading, setLoading] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [newMembershipType, setNewMembershipType] = useState({
    name: '',
    description: '',
    fee: 0,
    benefits: ''
  });

  useEffect(() => {
    fetchMembershipTypes();
  }, []);

  const fetchMembershipTypes = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/membership-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setMembershipTypes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching membership types:', error);
      toast.error('Failed to load membership types');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMembershipType(prev => ({
      ...prev,
      [name]: name === 'fee' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate inputs
      if (!newMembershipType.name || !newMembershipType.description || newMembershipType.fee <= 0) {
        toast.error('Please fill all required fields with valid values');
        setLoading(false);
        return;
      }
      
      // Format benefits as array
      const benefitsArray = newMembershipType.benefits
        .split('\n')
        .map(b => b.trim())
        .filter(b => b);
      
      const payload = {
        ...newMembershipType,
        benefits: benefitsArray
      };
      
      const response = await axios.post('/api/membership-types', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('Membership type created successfully');
      
      // Reset form and refresh list
      setNewMembershipType({
        name: '',
        description: '',
        fee: 0,
        benefits: ''
      });
      
      fetchMembershipTypes();
    } catch (error) {
      console.error('Error creating membership type:', error);
      toast.error(error.response?.data?.message || 'Failed to create membership type');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Membership Types Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Membership Types</h3>
          
          {/* Add New Membership Type */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Add New Membership Type</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={newMembershipType.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <input
                  type="text"
                  name="description"
                  value={newMembershipType.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Fee*
                </label>
                <input
                  type="number"
                  name="fee"
                  value={newMembershipType.fee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits (one per line)
                </label>
                <textarea
                  name="benefits"
                  value={newMembershipType.benefits}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter benefits, one per line"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Creating...' : 'Create Membership Type'}
              </button>
            </form>
          </div>
          
          {/* Existing Membership Types */}
          <div>
            <h4 className="text-lg font-medium mb-3">Existing Membership Types</h4>
            {loading ? (
              <Loading />
            ) : membershipTypes.length === 0 ? (
              <p className="text-gray-500">No membership types defined yet.</p>
            ) : (
              <div className="space-y-4">
                {membershipTypes.map(type => (
                  <div key={type._id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold">{type.name}</h5>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-blue-600">${type.fee}/year</span>
                      </div>
                    </div>
                    
                    {type.benefits && type.benefits.length > 0 && (
                      <div className="mt-2">
                        <h6 className="text-xs font-medium text-gray-500 uppercase mb-1">Benefits:</h6>
                        <ul className="text-sm list-disc pl-5 text-gray-600">
                          {type.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* System Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">System Preferences</h3>
          
          <div className="border-b pb-4 mb-4">
            <h4 className="text-lg font-medium mb-3">Email Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notify-new-application"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="notify-new-application" className="ml-2 text-sm text-gray-700">
                  Notify admins when new membership application is submitted
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notify-expiring"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="notify-expiring" className="ml-2 text-sm text-gray-700">
                  Notify members when their membership is about to expire
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notify-approved"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="notify-approved" className="ml-2 text-sm text-gray-700">
                  Notify users when their membership application is approved
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-3">Membership Rules</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Membership Duration (months)
                </label>
                <input
                  type="number"
                  defaultValue={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days Before Expiration to Send Reminder
                </label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors w-full">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const MembershipApplication = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    duration: 12, // Default to 12 months
    agreeToTerms: false
  });
  
  const navigate = useNavigate();

  // Prevent admins from accessing this page
  useEffect(() => {
    if (user && (user.isAdmin || user.role === 'admin')) {
      toast.error('Administrators cannot apply for memberships');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch available membership types
  useEffect(() => {
    const fetchMembershipTypes = async () => {
      try {
        const response = await axios.get('https://library-management-system-1-53kq.onrender.com/api/books/api/membership-types');
        console.log('Fetched membership types:', response.data);
        
        if (response.data && response.data.length > 0) {
          setMembershipTypes(response.data);
          setFormData(prev => ({ ...prev, type: response.data[0]._id || response.data[0].name }));
        } else {
          // Set default types if none returned
          const defaultTypes = [
            { _id: 'standard', name: 'Standard', description: 'Regular membership with basic benefits', fee: 50 },
            { _id: 'premium', name: 'Premium', description: 'Enhanced membership with additional benefits', fee: 100 }
          ];
          setMembershipTypes(defaultTypes);
          setFormData(prev => ({ ...prev, type: defaultTypes[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching membership types:', error);
        toast.error('Could not load membership types. Using defaults.');
        
        // Set default types if API fails
        const defaultTypes = [
          { _id: 'standard', name: 'Standard', description: 'Regular membership with basic benefits', fee: 50 },
          { _id: 'premium', name: 'Premium', description: 'Enhanced membership with additional benefits', fee: 100 }
        ];
        setMembershipTypes(defaultTypes);
        setFormData(prev => ({ ...prev, type: defaultTypes[0]._id }));
      }
    };

    fetchMembershipTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateTotal = () => {
    const selectedType = membershipTypes.find(type => type._id === formData.type);
    if (!selectedType) return 0;
    return selectedType.fee * (formData.duration / 12);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to apply for membership');
        navigate('/login');
        return;
      }
      
      console.log('Submitting membership application:', formData);
      
      const response = await axios.post('/api/memberships/apply', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Application response:', response.data);
      
      toast.success('Membership application submitted successfully!');
      navigate('/my-memberships');
    } catch (error) {
      console.error('Error submitting membership application:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Processing your application...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Apply for Membership</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Membership Type Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Membership Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {membershipTypes.map(type => (
                <div 
                  key={type._id}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    formData.type === type._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: type._id }))}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="type"
                      value={type._id}
                      checked={formData.type === type._id}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <div className="ml-2">
                      <h3 className="font-semibold">{type.name}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                      <p className="text-blue-600 font-medium mt-1">${type.fee}/year</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Duration Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Duration
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={12}>1 Year</option>
              <option value={24}>2 Years</option>
              <option value={36}>3 Years</option>
            </select>
          </div>
          
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="flex justify-between">
              <span>Total Payment:</span>
              <span className="font-bold">${calculateTotal()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Payment will be processed after your application is approved.
            </p>
          </div>
          
          {/* Terms and Conditions */}
          <div className="border-t pt-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1"
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the <a href="/terms" className="text-blue-500">terms and conditions</a> and understand that my membership application is subject to approval.
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              disabled={!formData.agreeToTerms || loading}
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipApplication; 
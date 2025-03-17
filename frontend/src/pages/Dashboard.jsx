import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BookCard from '../components/books/BookCard';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentBooks, setRecentBooks] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchRecentBooks(),
          user && fetchUserMembership()
        ]);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchRecentBooks = async () => {
    try {
      const response = await axios.get('https://library-management-system-1-53kq.onrender.com/api/books');
      setRecentBooks(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent books:', error);
      throw error;
    }
  };

  const fetchUserMembership = async () => {
    if (!user || !user.id) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/memberships/user/${user.id}`);
      setUserMembership(response.data);
    } catch (error) {
      console.error('Error fetching membership:', error);
      // Don't throw here - membership might not exist for all users
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <p className="text-gray-600 mb-4">View and manage your personal information and membership details.</p>
          <a 
            href="/profile" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View Profile
          </a>
        </div>
        
        {/* Memberships Card */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">My Memberships</h2>
          <p className="text-gray-600 mb-4">Manage your library memberships and subscription details.</p>
          <a 
            href="/my-memberships" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View Memberships
          </a>
        </div>
        
        {/* Other dashboard cards... */}
      </div>
    </div>
  );
};

export default Dashboard;
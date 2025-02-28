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
      const response = await axios.get('http://localhost:5000/api/books');
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'User'}</h1>
      
      {userMembership && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Membership</h2>
          <p>Membership Number: {userMembership.membershipNumber}</p>
          <p>Valid until: {new Date(userMembership.endDate).toLocaleDateString()}</p>
          <p>Status: <span className={`px-2 py-1 rounded-full text-sm ${
            userMembership.status === 'active' ? 'bg-green-100 text-green-800' : 
            userMembership.status === 'expired' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>{userMembership.status}</span></p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recently Added Books</h2>
        {recentBooks.length === 0 ? (
          <p className="text-gray-500">No books available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBooks.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
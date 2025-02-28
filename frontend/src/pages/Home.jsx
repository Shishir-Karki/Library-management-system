import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Library Management System</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Browse Books</h2>
          <p className="text-gray-600 mb-4">
            Explore our collection of books and find your next read.
          </p>
          <Link 
            to="/books" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            View Books
          </Link>
        </div>
        {!user ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Join Us</h2>
            <p className="text-gray-600 mb-4">
              Create an account to access all features.
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Register Now
            </Link>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Access your personal dashboard.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-block bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
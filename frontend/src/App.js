import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

import Unauthorized from './pages/Unauthorized';

// Book Components
import BookList from './components/books/BookList';
import BookDetail from './components/books/BookDetail';
import AddBook from './pages/Maintenance/AddBook';
import UpdateBook from './pages/Maintenance/UpdateBook';

// Membership Components
import MembershipManagement from './components/membership/MembershipForm';
import UserMemberships from './components/membership/UserMemberships';
import MembershipApplication from './components/membership/MembershipApplication';

// User Management


// User Profile Component
import UserProfile from './components/profile/UserProfile';

// Admin Components
import AdminDashboard from './components/admin/Dashboard';
import MemberDetail from './components/admin/MemberDetail';
import MemberEdit from './components/admin/MemberEdit';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

// Important: Set withCredentials to false since we're using Bearer token auth
// and not cookie-based auth. This was causing the CORS issue.
axios.defaults.withCredentials = false;

// Initialize auth token from localStorage
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Placeholder components for routes that don't have implementations yet
const Transactions = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Transactions</h1>
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <p className="text-yellow-700">
        This feature is coming soon. Check back later!
      </p>
    </div>
  </div>
);

const Reports = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Reports</h1>
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <p className="text-yellow-700">
        This feature is coming soon. Check back later!
      </p>
    </div>
  </div>
);

// Auth state listener component
const AuthStateListener = () => {
  const { user, loading, tokenChecked, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for storage events (when localStorage changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue && user) {
          // Token was removed in another tab
          toast.info('You have been logged out in another window');
          logout();
          navigate('/login');
        } else if (e.newValue && !user && tokenChecked) {
          // Token was added in another tab
          toast.success('You have been logged in in another window');
          window.location.reload(); // Force reload to update auth state
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, tokenChecked, logout, navigate]);

  return null; // This component doesn't render anything
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AuthStateListener />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
         
          <Route 
            path="/maintenance/add-book" 
            element={
              <ProtectedRoute adminOnly>
                <AddBook />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/maintenance/update-book/:id" 
            element={
              <ProtectedRoute adminOnly>
                <UpdateBook />
              </ProtectedRoute>
            } 
          />
         
         
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/members/:id" 
            element={
              <ProtectedRoute adminOnly={true}>
                <MemberDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/members/:id/edit" 
            element={
              <ProtectedRoute adminOnly={true}>
                <MemberEdit />
              </ProtectedRoute>
            } 
          />

          {/* Membership Routes */}
          <Route 
            path="/my-memberships" 
            element={
              <ProtectedRoute>
                <UserMemberships />
              </ProtectedRoute>
            } 
          />

          {/* User Profile Route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />

          {/* Membership application - block admins */}
          <Route 
            path="/membership/apply" 
            element={
              <ProtectedRoute>
                <MembershipApplication />
              </ProtectedRoute>
            } 
          />

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="container mx-auto p-8 text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-xl mb-6">Page not found</p>
              <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';

// Book Components
import BookList from './components/books/BookList';
import AddBook from './pages/Maintenance/AddBook';
import UpdateBook from './pages/Maintenance/UpdateBook';

// Membership Components
import MembershipManagement from './components/membership/MembershipForm';
import UserMemberships from './components/membership/UserMemberships';

// User Management
import UserManagement from './pages/Maintenance/UserManagement';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
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
                path="/maintenance" 
                element={
                  <ProtectedRoute adminOnly>
                    <Maintenance />
                  </ProtectedRoute>
                } 
              />
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
                path="/maintenance/membership" 
                element={
                  <ProtectedRoute adminOnly>
                    <MembershipManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/maintenance/users" 
                element={
                  <ProtectedRoute adminOnly>
                    <UserManagement />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div>
          <Link to="/" className="text-xl font-bold">Library System</Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-300">Home</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
              <Link to="/profile" className="hover:text-blue-300">My Profile</Link>
              
              {/* Admin-specific links */}
              {(user.isAdmin || user.role === 'admin') && (
                <div className="relative group">
                  <Link 
                    to="/admin" 
                    className="hover:text-blue-300 flex items-center"
                  >
                    <span>Admin</span>
                    <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                      New
                    </span>
                  </Link>
                  <div className="absolute z-10 hidden group-hover:block mt-2 bg-white text-gray-800 shadow-lg rounded-md overflow-hidden w-48">
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 hover:bg-gray-100 border-t border-gray-200"
                    >
                      Pending Applications
                    </Link>
                  </div>
                </div>
              )}
              
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-300">Login</Link>
              <Link to="/register" className="hover:text-blue-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="text-lg font-bold">Library Management</Link>
          <div className="flex items-center space-x-6">
            <Link to="/books" className="hover:text-gray-200">Books</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
                {isAdmin && <Link to="/maintenance/membership" className="hover:text-gray-200">Membership</Link>}
                {isAdmin && <Link to="/maintenance" className="hover:text-gray-200">Maintenance</Link>}
                <Link to="/transactions" className="hover:text-gray-200">Transactions</Link>
                <button 
                  onClick={logout}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-200">Login</Link>
                <Link to="/register" className="hover:text-gray-200">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <Link to="/" className="text-lg font-bold">Library Management</Link>
          <button 
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            <Link to="/books" className="block hover:text-gray-200">Books</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block hover:text-gray-200">Dashboard</Link>
                {isAdmin && <Link to="/maintenance/membership" className="block hover:text-gray-200">Membership</Link>}
                {isAdmin && <Link to="/maintenance" className="block hover:text-gray-200">Maintenance</Link>}
                <Link to="/transactions" className="block hover:text-gray-200">Transactions</Link>
                <button 
                  onClick={logout}
                  className="block w-full text-left bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-gray-200">Login</Link>
                <Link to="/register" className="block hover:text-gray-200">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
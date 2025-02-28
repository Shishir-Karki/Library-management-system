import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set auth header
          axios.defaults.headers.common['x-auth-token'] = token;
          
          // Get user data
          const res = await axios.get('http://localhost:5000/api/auth/profile');
          setUser(res.data);
          setIsAdmin(res.data.role === 'admin');
        }
      } catch (err) {
        // Invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    
    // Set auth header
    if (localStorage.getItem('token')) {
      axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
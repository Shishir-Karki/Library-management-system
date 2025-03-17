import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Set up axios interceptors for authentication
  useEffect(() => {
    // Request interceptor to add token to all requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle authentication errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token expired or invalid
          if (localStorage.getItem('token')) {
            toast.error('Your session has expired. Please log in again.');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptors when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set default auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const res = await axios.get('https://library-management-system-1-53kq.onrender.com/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.data) {
            setUser(res.data);
            setIsAdmin(res.data.role === 'admin');
            
            // Refresh token if needed (optional, depends on your backend implementation)
            try {
              const refreshRes = await axios.post('http://localhost:5000/api/auth/refresh-token', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (refreshRes.data && refreshRes.data.token) {
                localStorage.setItem('token', refreshRes.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${refreshRes.data.token}`;
              }
            } catch (refreshErr) {
              console.error('Token refresh failed:', refreshErr);
              // Continue with the existing token
            }
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Invalid token - clear it
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        setTokenChecked(true);
      }
    };

    checkLoggedIn();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    
    // If token is provided, update it
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    // Optional: Call logout endpoint to invalidate token on server
    try {
      axios.post('http://localhost:5000/api/auth/logout').catch(() => {
        // Ignore errors from logout endpoint
      });
    } catch (error) {
      // Ignore any errors during logout
    }
  };

  // Provide a method to check token validity
  const checkTokenValidity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const res = await axios.get('http://localhost:5000/api/auth/verify-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return res.status === 200;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      login, 
      logout, 
      loading,
      tokenChecked,
      checkTokenValidity
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

const Maintenance = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeMembers: 0,
    pendingReturns: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchSystemStats();
    }
  }, [isAdmin]);

  const fetchSystemStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Fetch books count
      const booksResponse = await axios.get('http://localhost:5000/api/books', { headers });
      const totalBooks = booksResponse.data.length;
      
      // Fetch memberships to count active members
      const membershipsResponse = await axios.get('http://localhost:5000/api/memberships', { headers });
      const activeMembers = membershipsResponse.data.filter(m => m.status === 'active').length;
      
      // For pending returns, we would need a transactions API
      // For now, let's set a placeholder or calculate from available data
      // This would be replaced with actual API call when you implement transactions
      const pendingReturns = 0; // Placeholder
      
      setStats({
        totalBooks,
        activeMembers,
        pendingReturns
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
      setError('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You do not have permission to access this page.</p>
        </Alert>
      </div>
    );
  }

  const maintenanceItems = [
    {
      title: 'Book Management',
      description: 'Add, edit, or remove books from the library collection',
      link: '/maintenance/add-book',
      icon: '📚'
    },
    {
      title: 'Membership Management',
      description: 'Manage user memberships and subscription plans',
      link: '/maintenance/membership',
      icon: '🎫'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      link: '/maintenance/users',
      icon: '👥'
    },
    {
      title: 'Reports',
      description: 'View and generate system reports',
      link: '/reports',
      icon: '📊'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">System Maintenance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {maintenanceItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>

      <Card className="bg-blue-50 p-0 rounded-lg shadow-sm">
        <Card.Header className="bg-blue-100 border-bottom-0">
          <h2 className="text-xl font-semibold mb-0">System Status</h2>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading system statistics...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <p>{error}</p>
              <div className="mt-2">
                <button 
                  onClick={fetchSystemStats}
                  className="btn btn-sm btn-outline-danger"
                >
                  Retry
                </button>
              </div>
            </Alert>
          ) : (
            <Row>
              <Col md={4}>
                <Card className="bg-white p-4 rounded shadow text-center h-100">
                  <h3 className="font-medium text-gray-700">Total Books</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalBooks}</p>
                  <p className="text-sm text-gray-500 mt-1">Books in the library collection</p>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-white p-4 rounded shadow text-center h-100">
                  <h3 className="font-medium text-gray-700">Active Members</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">{stats.activeMembers}</p>
                  <p className="text-sm text-gray-500 mt-1">Users with active memberships</p>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-white p-4 rounded shadow text-center h-100">
                  <h3 className="font-medium text-gray-700">Pending Returns</h3>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingReturns}</p>
                  <p className="text-sm text-gray-500 mt-1">Books due for return</p>
                </Card>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Maintenance;
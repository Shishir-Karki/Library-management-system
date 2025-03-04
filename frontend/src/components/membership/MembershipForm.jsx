import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MembershipCard from './MembershipCard';
import { Alert, Button, Form, Spinner, Row, Col, Card } from 'react-bootstrap';

const MembershipForm = () => {
  const { user, isAdmin } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'standard',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMemberships();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchMemberships = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setFetchLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/memberships', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      setMemberships(response.data);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      setError('Error fetching memberships: ' + (error.response?.data?.msg || error.message));
      toast.error('Error fetching memberships');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.userId) {
      errors.userId = 'Please select a user';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Log the request data for debugging
      console.log('Creating membership with data:', formData);
      
      const response = await axios.post('http://localhost:5000/api/memberships', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Membership created successfully:', response.data);
      toast.success('Membership created successfully');
      fetchMemberships();
      
      // Reset form
      setFormData({
        userId: '',
        type: 'standard',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      });
      setFormErrors({});
    } catch (error) {
      console.error('Error creating membership:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      toast.error(error.response?.data?.msg || 'Error creating membership');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (membershipId) => {
    if (!window.confirm('Are you sure you want to delete this membership?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/memberships/${membershipId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Membership deleted successfully');
      fetchMemberships();
    } catch (error) {
      console.error('Error deleting membership:', error);
      toast.error('Error deleting membership');
    }
  };

  const handleEdit = async (membershipId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const membership = memberships.find(m => m._id === membershipId);
      if (!membership) {
        toast.error('Membership not found');
        return;
      }
      
      // Set form data for editing
      setFormData({
        userId: membership.userId,
        type: membership.type || 'standard',
        startDate: new Date(membership.startDate).toISOString().split('T')[0],
        endDate: new Date(membership.endDate).toISOString().split('T')[0],
        status: membership.status || 'active'
      });
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.info('Please update the form and submit to edit the membership');
    } catch (error) {
      console.error('Error preparing membership edit:', error);
      toast.error('Error preparing membership edit');
    }
  };

  if (fetchLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" role="status" variant="primary" />
        <span className="ms-3">Loading memberships...</span>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4 border-bottom pb-2">Membership Management</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4 border border-danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              onClick={fetchMemberships}
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}
      
      {isAdmin && (
        <Card className="shadow-sm mb-4 border">
          <Card.Header className="bg-primary text-white border-bottom">
            <h4 className="mb-0">Create New Membership</h4>
          </Card.Header>
          <Card.Body className="border-bottom">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6} className="border-end">
                  <Form.Group className="mb-3">
                    <Form.Label>User <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={formData.userId}
                      onChange={(e) => {
                        setFormData({ ...formData, userId: e.target.value });
                        setFormErrors({ ...formErrors, userId: null });
                      }}
                      isInvalid={!!formErrors.userId}
                      className="border"
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.userId}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Membership Type</Form.Label>
                    <Form.Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="border"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="student">Student</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData({ ...formData, startDate: e.target.value });
                        setFormErrors({ ...formErrors, startDate: null });
                      }}
                      isInvalid={!!formErrors.startDate}
                      className="border"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.startDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => {
                        setFormData({ ...formData, endDate: e.target.value });
                        setFormErrors({ ...formErrors, endDate: null });
                      }}
                      isInvalid={!!formErrors.endDate}
                      className="border"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.endDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="border"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="pending">Pending</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-3 pt-3 border-top">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    setFormData({
                      userId: '',
                      type: 'standard',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      status: 'active'
                    });
                    setFormErrors({});
                  }}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Membership'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border">
        <Card.Header className="bg-light border-bottom">
          <h4 className="mb-0">All Memberships</h4>
        </Card.Header>
        <Card.Body>
          {memberships.length === 0 ? (
            <Alert variant="info" className="border">No memberships found.</Alert>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {memberships.map(membership => (
                <Col key={membership._id}>
                  <MembershipCard
                    membership={{
                      ...membership,
                      userName: membership.user ? membership.user.name : 'Unknown User',
                      onEdit: handleEdit,
                      onDelete: handleDelete
                    }}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MembershipForm;
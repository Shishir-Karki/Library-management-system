import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Button, Modal, Form, Alert, Badge, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users: ' + (err.response?.data?.msg || err.message));
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // You might want to trigger a logout here
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!currentUser && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (user = null) => {
    setFormErrors({});
    
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role
      });
    } else {
      setCurrentUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      if (currentUser) {
        // Update existing user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        
        await axios.put(`http://localhost:5000/api/users/${currentUser._id}`, updateData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('User updated successfully');
      } else {
        // Create new user
        await axios.post('http://localhost:5000/api/users', formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('User created successfully');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.msg || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Authentication token not found. Please log in again.');
          return;
        }
        
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error(err.response?.data?.msg || 'Error deleting user');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'user':
        return <Badge bg="primary">User</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You do not have permission to access this page.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center align-items-center p-5">
          <Spinner animation="border" role="status" variant="primary" />
          <span className="ms-3">Loading users...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h4 mb-0">User Management</h2>
            <Button 
              variant="primary" 
              className="d-flex align-items-center"
              onClick={() => handleOpenModal()}
            >
              <i className="bi bi-plus-circle me-2"></i> Add New User
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-4">
              <p>{error}</p>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={fetchUsers}
                >
                  Try Again
                </Button>
              </div>
            </Alert>
          )}
          
          {users.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>No Users Found</Alert.Heading>
              <p>There are no users in the system. Click the "Add New User" button to create one.</p>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3 fw-bold">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2" 
                          onClick={() => handleOpenModal(user)}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDelete(user._id)}
                        >
                          <i className="bi bi-trash me-1"></i> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Form Modal - Properly isolated as a popup dialog */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        backdrop="static" 
        animation={true}
        centered
        dialogClassName="modal-dialog-centered"
        contentClassName="shadow"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{currentUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                placeholder="Enter user's full name"
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange}
                isInvalid={!!formErrors.email}
                placeholder="Enter user's email address"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {currentUser ? 'New Password (leave blank to keep current)' : 'Password'} 
                {!currentUser && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange}
                isInvalid={!!formErrors.password}
                placeholder={currentUser ? "Enter new password (optional)" : "Enter password"}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Password should be at least 6 characters long.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Admin users have full access to all system features.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentUser ? 'Update' : 'Create'} User
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserManagement; 
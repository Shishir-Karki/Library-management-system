import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Button, Table, Modal, Form, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';


const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. ' + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.email.includes('@')) errors.email = 'Email is invalid';
    
    // Only validate password for new users
    if (!selectedUser && !formData.password) errors.password = 'Password is required';
    if (!selectedUser && formData.password && formData.password.length < 6) 
      errors.password = 'Password must be at least 6 characters';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('User added successfully');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      toast.error(err.response?.data?.msg || 'Error adding user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const updateData = { ...formData };
      
      // Only include password if it was changed
      if (!updateData.password) delete updateData.password;
      
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error(err.response?.data?.msg || 'Error updating user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.msg || 'Error deleting user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      role: user.role
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (!isAdmin) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="border">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You do not have permission to access this page.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      <Card className="shadow-sm border">
        <Card.Header className="bg-primary text-white border-bottom">
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 mb-0">User Management</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="light" 
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="border d-flex align-items-center"
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                <span>Add New User</span>
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-3 border">
              <p className="mb-0">{error}</p>
              <div className="mt-2">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={fetchUsers}
                  className="border"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> Retry
                </Button>
              </div>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="mb-0 border-top">
                <thead className="bg-light">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Created At</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <p className="text-muted mb-0">No users found</p>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                          }}
                        >
                          Add your first user
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td className="px-3 py-3">{user.name}</td>
                        <td className="px-3 py-3">{user.email}</td>
                        <td className="px-3 py-3">
                          <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'success'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 py-3 text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2 border"
                            onClick={() => openEditModal(user)}
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="border"
                            onClick={() => openDeleteModal(user)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add User Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="border-bottom bg-light">
          <Modal.Title>
            <i className="bi bi-person-plus-fill me-2 text-primary"></i>
            Add New User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body className="px-4 py-4">
            <Form.Group className="mb-3">
              <Form.Label>Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                className="border"
                placeholder="Enter user's full name"
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!formErrors.email}
                className="border"
                placeholder="Enter email address"
              />
              <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!formErrors.password}
                className="border"
                placeholder="Enter password (min. 6 characters)"
              />
              <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Password must be at least 6 characters long.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="border"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Admin users have full access to all system features.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top bg-light">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="border">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="border">
              <i className="bi bi-person-plus-fill me-1"></i> Add User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="border-bottom bg-light">
          <Modal.Title>
            <i className="bi bi-pencil-fill me-2 text-primary"></i>
            Edit User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditUser}>
          <Modal.Body className="px-4 py-4">
            <Form.Group className="mb-3">
              <Form.Label>Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                className="border"
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!formErrors.email}
                className="border"
              />
              <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password (Leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!formErrors.password}
                className="border"
                placeholder="Enter new password"
              />
              <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Only fill this if you want to change the password.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="border"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top bg-light">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="border">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="border">
              <i className="bi bi-save me-1"></i> Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        backdrop="static"
        centered
        size="sm"
      >
        <Modal.Header closeButton className="border-bottom bg-light">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <p>Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>?</p>
          <Alert variant="warning" className="border mb-0 py-2">
            <small>
              This action cannot be undone. All user data including memberships will be permanently removed.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-top bg-light">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="border">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} className="border">
            <i className="bi bi-trash-fill me-1"></i> Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement; 
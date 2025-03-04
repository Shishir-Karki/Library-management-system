import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Button, Row, Col, Modal, Form, Alert, Spinner, Container, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserCard from '../../components/user/UserCard';

const UserManagementCards = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="border shadow-sm">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You do not have permission to access this page.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      <Card className="shadow-sm border mb-4">
        <Card.Header className="bg-primary text-white border-bottom py-3">
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 mb-0">User Management</h1>
              <p className="mb-0 mt-1 text-white-50">Manage system users and their permissions</p>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button 
                  variant="light" 
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="border fw-bold d-flex align-items-center"
                >
                  <i className="bi bi-person-plus-fill me-2"></i>
                  <span>Add New User</span>
                </Button>
                <Button 
                  variant="outline-light" 
                  onClick={fetchUsers}
                  className="border d-flex align-items-center"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  <span>Refresh</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="border mb-4 shadow-sm">
              <Alert.Heading>Error Loading Users</Alert.Heading>
              <p>{error}</p>
              <div className="d-flex justify-content-end">
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

          {!loading && !error && (
            <div className="mb-4">
              <InputGroup className="border rounded shadow-sm">
                <InputGroup.Text className="bg-light border-0">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0"
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                    className="border-0"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                )}
              </InputGroup>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5 border rounded bg-light">
                  <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3">
                    {searchTerm ? 'No Users Found Matching Your Search' : 'No Users Found'}
                  </h3>
                  <p className="text-muted mb-4">
                    {searchTerm 
                      ? 'Try a different search term or clear the search'
                      : 'Get started by adding your first user'}
                  </p>
                  {!searchTerm ? (
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                      }}
                      className="shadow-sm"
                    >
                      <i className="bi bi-person-plus-fill me-2"></i>
                      Add your first user
                    </Button>
                  ) : (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm('')}
                      className="shadow-sm"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {searchTerm && (
                    <Alert variant="info" className="border mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <i className="bi bi-info-circle me-2"></i>
                          Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                        </span>
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          onClick={() => setSearchTerm('')}
                          className="border"
                        >
                          Clear
                        </Button>
                      </div>
                    </Alert>
                  )}
                  <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {filteredUsers.map(user => (
                      <Col key={user._id}>
                        <UserCard 
                          user={user} 
                          onEdit={openEditModal} 
                          onDelete={openDeleteModal} 
                        />
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </>
          )}
        </Card.Body>
        {!loading && filteredUsers.length > 0 && (
          <Card.Footer className="bg-light border-top p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={fetchUsers}
                className="border"
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)}
        backdrop="static"
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-person-plus-fill me-2"></i>
            Add New User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body className="px-4 py-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-person"></i>
                    </InputGroup.Text>
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
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-envelope"></i>
                    </InputGroup.Text>
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
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-key"></i>
                    </InputGroup.Text>
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
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-shield"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="border"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Admin users have full access to all system features.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Alert variant="info" className="mt-3 mb-0 border">
              <i className="bi bi-info-circle-fill me-2"></i>
              New users will need to use these credentials to log in to the system.
            </Alert>
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
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-pencil-fill me-2"></i>
            Edit User: {selectedUser?.name}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditUser}>
          <Modal.Body className="px-4 py-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-person"></i>
                    </InputGroup.Text>
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
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-envelope"></i>
                    </InputGroup.Text>
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
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password <span className="text-muted">(Leave blank to keep current)</span></Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-key"></i>
                    </InputGroup.Text>
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
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Only fill this if you want to change the password.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-shield"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="border"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Alert variant="warning" className="mt-3 mb-0 border">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Changing a user's role will immediately affect their system access permissions.
            </Alert>
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
      >
        <Modal.Header closeButton className="border-bottom bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <div className="text-center mb-4">
            <div className="avatar-circle mx-auto mb-3 bg-danger text-white">
              <i className="bi bi-person-x-fill" style={{ fontSize: '2rem' }}></i>
            </div>
            <h4>Delete User: {selectedUser?.name}</h4>
            <p className="text-muted">This action cannot be undone.</p>
          </div>
          
          <Alert variant="warning" className="border mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Warning:</strong> All user data including memberships will be permanently removed from the system.
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

      <style jsx="true">{`
        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Container>
  );
};

export default UserManagementCards; 
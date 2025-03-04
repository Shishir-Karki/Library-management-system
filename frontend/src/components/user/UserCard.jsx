import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';

const UserCard = ({ user, onEdit, onDelete }) => {
  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="h-100 shadow-sm border user-card">
      <Card.Header className={`d-flex justify-content-between align-items-center border-bottom py-3 ${
        user.role === 'admin' ? 'bg-danger text-white' : 'bg-primary text-white'
      }`}>
        <div className="d-flex align-items-center">
          <div className="avatar-circle me-2 bg-white text-dark">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h5 className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>{user.name}</h5>
        </div>
        <Badge bg={user.role === 'admin' ? 'light' : 'info'} text={user.role === 'admin' ? 'dark' : 'white'} className="px-3 py-2">
          {user.role.toUpperCase()}
        </Badge>
      </Card.Header>
      
      <Card.Body className="border-bottom p-3">
        <div className="mb-3 pb-2 border-bottom">
          <small className="text-muted d-block mb-1">Email Address</small>
          <div className="d-flex align-items-center">
            <i className="bi bi-envelope me-2 text-primary"></i>
            <span className="text-truncate">{user.email}</span>
          </div>
        </div>
        
        <div className="d-flex justify-content-between">
          <div className="border-end pe-3" style={{ flex: 1 }}>
            <small className="text-muted d-block mb-1">Created</small>
            <div className="d-flex align-items-center">
              <i className="bi bi-calendar-plus me-2 text-success"></i>
              <strong>{formatDate(user.createdAt)}</strong>
            </div>
          </div>
          <div className="ps-3" style={{ flex: 1 }}>
            <small className="text-muted d-block mb-1">Updated</small>
            <div className="d-flex align-items-center">
              <i className="bi bi-calendar-check me-2 text-info"></i>
              <strong>{formatDate(user.updatedAt)}</strong>
            </div>
          </div>
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-white border-top d-flex justify-content-between p-3">
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="border d-flex align-items-center" 
          onClick={() => onEdit && onEdit(user)}
        >
          <i className="bi bi-pencil-fill me-1"></i> Edit
        </Button>
        <Button 
          variant="outline-danger" 
          size="sm"
          className="border d-flex align-items-center"
          onClick={() => onDelete && onDelete(user)}
        >
          <i className="bi bi-trash-fill me-1"></i> Delete
        </Button>
      </Card.Footer>

      <style jsx="true">{`
        .user-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .user-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .avatar-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </Card>
  );
};

export default UserCard; 
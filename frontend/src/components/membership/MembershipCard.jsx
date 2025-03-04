import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from 'react-bootstrap';

const MembershipCard = ({ membership }) => {
  const { isAdmin } = useAuth();
  
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'expired':
        return <Badge bg="danger">Expired</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Capitalize first letter of type
  const formatType = (type) => {
    if (!type) return 'Standard';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Check if membership is expired
  const isExpired = () => {
    if (!membership.endDate) return false;
    return new Date(membership.endDate) < new Date();
  };

  return (
    <Card className="h-100 shadow-sm border">
      <Card.Header className={`d-flex justify-content-between align-items-center border-bottom ${
        isExpired() ? 'bg-danger text-white' : 'bg-primary text-white'
      }`}>
        <div>
          <h5 className="mb-0">{membership.membershipNumber || 'No Number'}</h5>
        </div>
        {getStatusBadge(membership.status)}
      </Card.Header>
      
      <Card.Body className="border-bottom">
        <Card.Title className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span>{membership.userName || 'Unknown User'}</span>
          <Badge bg="info" pill>{formatType(membership.type)}</Badge>
        </Card.Title>
        
        <Card.Text as="div">
          <div className="d-flex justify-content-between mb-3">
            <div className="border-end pe-2">
              <small className="text-muted d-block">Start Date</small>
              <strong>{formatDate(membership.startDate)}</strong>
            </div>
            <div className="ps-2">
              <small className="text-muted d-block">End Date</small>
              <strong>{formatDate(membership.endDate)}</strong>
            </div>
          </div>
          
          {isExpired() && (
            <div className="alert alert-danger py-2 mb-0 border">
              <small className="fw-bold">This membership has expired</small>
            </div>
          )}
        </Card.Text>
      </Card.Body>
      
      {isAdmin && (
        <Card.Footer className="bg-white border-top d-flex justify-content-end">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2 border" 
            onClick={() => membership.onEdit && membership.onEdit(membership._id)}
          >
            <i className="bi bi-pencil me-1"></i> Edit
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            className="border-yellow-50"
            onClick={() => membership.onDelete && membership.onDelete(membership._id)}
          >
            <i className="bi bi-trash me-1"></i> Delete
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default MembershipCard;
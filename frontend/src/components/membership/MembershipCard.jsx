import { useAuth } from '../../context/AuthContext';

const MembershipCard = ({ membership }) => {
  const { isAdmin } = useAuth();
  
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{membership.membershipNumber}</h3>
          <p className="text-gray-600">Member: {membership.userName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(membership.status)}`}>
          {membership.status}
        </span>
      </div>
      
      <div className="space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">Start Date:</span>{' '}
          {new Date(membership.startDate).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">End Date:</span>{' '}
          {new Date(membership.endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Type:</span>{' '}
          {membership.type}
        </p>
      </div>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            className="text-blue-600 hover:text-blue-800 mr-4"
            onClick={() => membership.onEdit(membership._id)}
          >
            Edit
          </button>
          <button 
            className="text-red-600 hover:text-red-800"
            onClick={() => membership.onDelete(membership._id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MembershipCard;
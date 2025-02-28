import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Maintenance = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium">Total Books</h3>
            <p className="text-2xl font-bold text-blue-600">Loading...</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium">Active Members</h3>
            <p className="text-2xl font-bold text-green-600">Loading...</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium">Pending Returns</h3>
            <p className="text-2xl font-bold text-yellow-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Table, Card, Button, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';

const Reports = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data states
  const [overviewData, setOverviewData] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalMembers: 0,
    activeMembers: 0,
    expiredMemberships: 0
  });
  const [booksByGenre, setBooksByGenre] = useState([]);
  const [membershipsByType, setMembershipsByType] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch actual data from the backend
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch overview data
      const overviewResponse = await axios.get('http://localhost:5000/api/reports/overview', { headers })
        .catch(err => {
          console.error('Error fetching overview data:', err);
          return { data: { totalBooks: 0, availableBooks: 0, totalMembers: 0, activeMembers: 0, expiredMemberships: 0 } };
        });
      
      // Fetch books by genre
      const genreResponse = await axios.get('http://localhost:5000/api/reports/books-by-genre', { headers })
        .catch(err => {
          console.error('Error fetching genre data:', err);
          return { data: [] };
        });
      
      // Fetch memberships by type
      const membershipResponse = await axios.get('http://localhost:5000/api/reports/memberships-by-type', { headers })
        .catch(err => {
          console.error('Error fetching membership data:', err);
          return { data: [] };
        });
      
      // Fetch recent transactions
      const transactionsResponse = await axios.get('http://localhost:5000/api/reports/recent-transactions', { headers })
        .catch(err => {
          console.error('Error fetching transactions data:', err);
          return { data: [] };
        });
      
      // Fetch popular books
      const popularBooksResponse = await axios.get('http://localhost:5000/api/reports/popular-books', { headers })
        .catch(err => {
          console.error('Error fetching popular books data:', err);
          return { data: [] };
        });
      
      // Update state with fetched data
      setOverviewData(overviewResponse.data);
      setBooksByGenre(genreResponse.data);
      setMembershipsByType(membershipResponse.data);
      setRecentTransactions(transactionsResponse.data);
      setPopularBooks(popularBooksResponse.data);
      
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again later.');
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate percentage safely
  const calculatePercentage = (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  const handleExportReport = (reportType) => {
    toast.info(`Exporting ${reportType} report...`);
    // In a real application, this would trigger a download of the report
    setTimeout(() => {
      toast.success(`${reportType} report exported successfully!`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Reports</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchReportData}>Retry</Button>
        </Alert>
      </div>
    );
  }

  // Check if we have empty data
  const hasNoBooks = !overviewData.totalBooks || overviewData.totalBooks === 0;
  const hasNoMembers = !overviewData.totalMembers || overviewData.totalMembers === 0;
  const hasNoGenres = !booksByGenre.length;
  const hasNoMembershipTypes = !membershipsByType.length;
  const hasNoTransactions = !recentTransactions.length;
  const hasNoPopularBooks = !popularBooks.length;

  return (
    <div className="container mx-auto p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold">Library Reports</h1>
        {isAdmin && (
          <Button 
            variant="success"
            onClick={() => handleExportReport(activeTab)}
          >
            Export Report
          </Button>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h3 className="text-xl font-semibold text-gray-600">Total Books</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{overviewData.totalBooks || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {hasNoBooks ? 'No books in library' : 
                      `${overviewData.availableBooks || 0} available (${calculatePercentage(overviewData.availableBooks, overviewData.totalBooks)}%)`
                    }
                  </p>
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h3 className="text-xl font-semibold text-gray-600">Total Members</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">{overviewData.totalMembers || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {hasNoMembers ? 'No members registered' : 
                      `${overviewData.activeMembers || 0} active (${calculatePercentage(overviewData.activeMembers, overviewData.totalMembers)}%)`
                    }
                  </p>
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h3 className="text-xl font-semibold text-gray-600">Books Borrowed</h3>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">
                    {hasNoBooks ? 0 : (overviewData.totalBooks - overviewData.availableBooks) || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {hasNoBooks ? 'No books borrowed' : 
                      `${calculatePercentage(overviewData.totalBooks - overviewData.availableBooks, overviewData.totalBooks)}% of collection`
                    }
                  </p>
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h3 className="text-xl font-semibold text-gray-600">Expired Memberships</h3>
                  <p className="text-4xl font-bold text-red-600 mt-2">{overviewData.expiredMemberships || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {overviewData.expiredMemberships ? 'Requires renewal' : 'No expired memberships'}
                  </p>
                </Card.Body>
              </Card>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6">
              <Card className="shadow-sm">
                <Card.Header>Books by Genre</Card.Header>
                <Card.Body>
                  {hasNoGenres ? (
                    <div className="text-center py-5 text-gray-500">
                      No genre data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={booksByGenre}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {booksByGenre.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-6">
              <Card className="shadow-sm">
                <Card.Header>Memberships by Type</Card.Header>
                <Card.Body>
                  {hasNoMembershipTypes ? (
                    <div className="text-center py-5 text-gray-500">
                      No membership data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={membershipsByType}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Members" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="books" title="Books Report">
          <Card className="shadow-sm mb-4">
            <Card.Header>Most Popular Books</Card.Header>
            <Card.Body>
              {hasNoPopularBooks ? (
                <div className="text-center py-5 text-gray-500">
                  No book borrowing data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={popularBooks}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" name="Times Borrowed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>Books by Genre Distribution</Card.Header>
            <Card.Body>
              {hasNoGenres ? (
                <div className="text-center py-5 text-gray-500">
                  No genre data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={booksByGenre}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {booksByGenre.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="members" title="Members Report">
          <Card className="shadow-sm mb-4">
            <Card.Header>Membership Status</Card.Header>
            <Card.Body>
              {hasNoMembers ? (
                <div className="text-center py-5 text-gray-500">
                  No membership data available
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Active', value: overviewData.activeMembers || 0 },
                            { name: 'Expired', value: overviewData.expiredMemberships || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#00C49F" />
                          <Cell fill="#FF8042" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="col-md-6">
                    {hasNoMembershipTypes ? (
                      <div className="text-center py-5 text-gray-500">
                        No membership type data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={membershipsByType}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" name="Members" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="transactions" title="Transactions">
          <Card className="shadow-sm">
            <Card.Header>Recent Transactions</Card.Header>
            <Card.Body>
              {hasNoTransactions ? (
                <div className="text-center py-5 text-gray-500">
                  No transaction data available
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Book</th>
                      <th>Member</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>
                          <span className={`badge ${
                            transaction.type === 'Borrow' ? 'bg-warning' : 
                            transaction.type === 'Return' ? 'bg-success' : 
                            'bg-info'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.bookTitle}</td>
                        <td>{transaction.memberName}</td>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Reports; 
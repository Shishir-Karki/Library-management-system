import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState(null);
  const [userBorrowings, setUserBorrowings] = useState([]);

  useEffect(() => {
    fetchBookDetails();
    if (user) {
      fetchUserBorrowings();
    }
  }, [id, user]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://library-management-system-1-53kq.onrender.com/api/books/api/books/${id}`);
      setBook(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to load book details');
      toast.error('Failed to load book details');
      setLoading(false);
    }
  };

  const fetchUserBorrowings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/borrowings/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching user borrowings:', error);
    }
  };

  const handleBorrow = async () => {
    if (!user) {
      toast.info('Please log in to borrow books');
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }

    // Check if user has active membership
    if (!user.membership || user.membership.status !== 'active') {
      toast.warning('You need an active membership to borrow books');
      navigate('/membership/apply');
      return;
    }

    try {
      setBorrowing(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/borrowings',
        { bookId: id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Book borrowed successfully!');
      setBook(prev => ({ ...prev, availableCopies: prev.availableCopies - 1 }));
      fetchUserBorrowings();
      setBorrowing(false);
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error(error.response?.data?.message || 'Failed to borrow book');
      setBorrowing(false);
    }
  };

  const handleReturn = async () => {
    try {
      setBorrowing(true);
      const borrowing = userBorrowings.find(b => b.book._id === id && !b.returnDate);
      
      if (!borrowing) {
        toast.error('No active borrowing found for this book');
        setBorrowing(false);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(
        `/api/borrowings/${borrowing._id}/return`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Book returned successfully!');
      setBook(prev => ({ ...prev, availableCopies: prev.availableCopies + 1 }));
      fetchUserBorrowings();
      setBorrowing(false);
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.response?.data?.message || 'Failed to return book');
      setBorrowing(false);
    }
  };

  const isBookBorrowed = () => {
    return userBorrowings.some(b => b.book._id === id && !b.returnDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Loading book details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/books')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Books
          </button>
          <button 
            onClick={fetchBookDetails} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Book not found</p>
        </div>
        <button 
          onClick={() => navigate('/books')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Book Cover/Image */}
          <div className="md:w-1/3 bg-gray-100 flex justify-center items-center p-8">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={`${book.title} cover`} 
                className="max-h-96 object-contain"
              />
            ) : (
              <div className="w-full h-80 bg-gray-200 flex justify-center items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Book Details */}
          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-lg text-gray-600 mb-4">by {book.author}</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  book.availableCopies > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Book Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">ISBN:</span> {book.isbn}</p>
                  <p><span className="font-medium">Publisher:</span> {book.publisher}</p>
                  <p><span className="font-medium">Published Year:</span> {book.publishedYear}</p>
                  <p><span className="font-medium">Genre:</span> {book.genre}</p>
                  <p><span className="font-medium">Pages:</span> {book.pages}</p>
                  <p><span className="font-medium">Language:</span> {book.language}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Availability</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Total Copies:</span> {book.totalCopies}</p>
                  <p><span className="font-medium">Available Copies:</span> {book.availableCopies}</p>
                  <p><span className="font-medium">Location:</span> {book.location || 'Main Section'}</p>
                  {book.availableCopies > 0 && !isBookBorrowed() && (
                    <button
                      onClick={handleBorrow}
                      disabled={borrowing}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {borrowing ? 'Processing...' : 'Borrow Now'}
                    </button>
                  )}
                  {isBookBorrowed() && (
                    <button
                      onClick={handleReturn}
                      disabled={borrowing}
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                      {borrowing ? 'Processing...' : 'Return Book'}
                    </button>
                  )}
                  {book.availableCopies === 0 && !isBookBorrowed() && (
                    <button
                      disabled
                      className="mt-4 bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed"
                    >
                      Currently Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {book.description || 'No description available for this book.'}
              </p>
            </div>
            
            {book.tags && book.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Back Button */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <button 
            onClick={() => navigate('/books')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Books
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetail; 
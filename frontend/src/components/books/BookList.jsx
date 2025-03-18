import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BookSearch from './BookSearch';
import BookCard from './BookCard';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://library-management-system-1-53kq.onrender.com/api/books');
      setBooks(response.data);
    } catch (error) {
      toast.error('Error fetching books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/books/${bookId}`);
      toast.success('Book deleted successfully');
      fetchBooks(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error deleting book');
    }
  };

  const handleToggleAvailability = async (book) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${book._id}`, {
        ...book,
        available: !book.available
      });
      toast.success('Book availability updated');
      fetchBooks(); // Refresh the list
    } catch (error) {
      toast.error('Error updating book availability');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Book Collection</h1>
        {isAdmin && (
          <Link
            to="/maintenance/add-book"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add New Book
          </Link>
        )}
      </div>

      <BookSearch 
        onSearchResults={(results) => {
          if (results === null) {
            fetchBooks();
          } else {
            setBooks(results);
          }
        }} 
      />

      {books.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No books found. Try adjusting your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div key={book._id} className="relative">
              <Link to={`/books/${book._id}`} className="block">
                <BookCard book={book} />
              </Link>
              {isAdmin && (
                <div className="absolute top-2 right-2 space-x-2">
                  <Link
                    to={`/maintenance/update-book/${book._id}`}
                    className="inline-block bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleAvailability(book)}
                    className={`px-2 py-1 rounded text-sm ${
                      book.available
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    {book.available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
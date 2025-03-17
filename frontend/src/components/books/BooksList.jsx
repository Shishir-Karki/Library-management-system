import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    available: false,
    page: 1
  });
  const [genres, setGenres] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [filters.page, filters.genre, filters.available]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', 12);
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.genre) {
        params.append('genre', filters.genre);
      }
      
      if (filters.available) {
        params.append('available', 'true');
      }
      
      const response = await axios.get(`/api/books?${params.toString()}`);
      
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books');
      toast.error('Failed to load books');
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get('https://library-management-system-1-53kq.onrender.com/api/books/genres');
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading />
        <span className="ml-2">Loading books...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Library Books</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">Search Books</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title, author, or keywords"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Genre</label>
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre, index) => (
                <option key={index} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={filters.available}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="available" className="ml-2 text-gray-700">
              Available Only
            </label>
          </div>
          
          <div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      
      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <p className="text-yellow-700 mb-4">No books found matching your criteria.</p>
          <button 
            onClick={() => {
              setFilters({
                search: '',
                genre: '',
                available: false,
                page: 1
              });
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link to={`/books/${book._id}`} key={book._id} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full transition-transform transform group-hover:scale-105">
                  <div className="h-56 bg-gray-200 flex justify-center items-center">
                    {book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={`${book.title} cover`} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{book.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        book.availableCopies > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">by {book.author}</p>
                    <p className="text-gray-500 text-xs mb-2">Genre: {book.genre}</p>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {book.description || 'No description available.'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={filters.page <= 1}
                className={`px-3 py-1 rounded ${
                  filters.page <= 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className={`px-3 py-1 rounded ${
                  filters.page <= 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Prev
              </button>
              
              <span className="px-3 py-1">
                Page {filters.page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className={`px-3 py-1 rounded ${
                  filters.page >= totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={filters.page >= totalPages}
                className={`px-3 py-1 rounded ${
                  filters.page >= totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Last
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default BooksList; 
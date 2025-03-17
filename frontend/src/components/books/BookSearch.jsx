import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const BookSearch = ({ onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`https://library-management-system-1-53kq.onrender.com/api/booksapi/books/search?query=${searchQuery}`);
      onSearchResults(response.data);
    } catch (error) {
      toast.error('Error searching books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    onSearchResults(null); // This will trigger a re-fetch of all books in the parent component
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, or serial number..."
          className="p-2 border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded text-white ${
            isLoading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
};

export default BookSearch;
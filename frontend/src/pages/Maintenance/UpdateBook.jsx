import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UpdateBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    serialNumber: '',
    type: 'physical',
    available: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`https://library-management-system-1-53kq.onrender.com/api/books/${id}`);
        setFormData(response.data);
      } catch (error) {
        toast.error('Error fetching book details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/books/${id}`, formData);
      toast.success('Book updated successfully');
      navigate('/books'); // Redirect to the book list
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error updating book');
    } finally {
      setIsLoading(false);
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
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Update Book</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Author</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Serial Number</label>
          <input
            type="text"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Availability</label>
          <select
            value={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.value === 'true' })}
            className="w-full p-2 border rounded"
          >
            <option value={true}>Available</option>
            <option value={false}>Not Available</option>
          </select>
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Update Book
        </button>
      </form>
    </div>
  );
};

export default UpdateBook;
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddBookForm = ({ onBookAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    serialNumber: '',
    genre: '',
    description: '',
    publishedYear: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const generateSerialNumber = () => {
    const serialNumber = 'BOOK' + Math.floor(100000 + Math.random() * 900000);
    setFormData({
      ...formData,
      serialNumber
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate serial number if not provided
    if (!formData.serialNumber.trim()) {
      generateSerialNumber();
      return; // This will cause a re-render with the new serial number, and the form will be submitted on the next cycle
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/books', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Book added successfully');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        serialNumber: '',
        genre: '',
        description: '',
        publishedYear: '',
        quantity: 1
      });
      
      // Notify parent component
      if (onBookAdded) {
        onBookAdded(response.data.book);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error.response?.data?.message || 'Failed to add book');
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Author <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Serial Number <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            required
          />
          <button
            type="button"
            onClick={generateSerialNumber}
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
          >
            Generate
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the book. Click "Generate" for an automatic serial number.
        </p>
      </div>
      
      {/* Other form fields */}
      
      <div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default AddBookForm; 
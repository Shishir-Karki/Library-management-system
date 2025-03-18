import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for book operations
export const fetchAllBooks = createAsyncThunk(
  'books/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/books');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBookCopies = createAsyncThunk(
  'books/updateCopies',
  async ({ bookId, totalCopies, availableCopies }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/books/${bookId}/copies`, {
        totalCopies,
        availableCopies
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    books: [],
    loading: false,
    error: null,
    totalBooks: 0,
    availableBooks: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
        state.totalBooks = action.payload.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
        state.availableBooks = action.payload.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBookCopies.fulfilled, (state, action) => {
        const index = state.books.findIndex(book => book._id === action.payload._id);
        if (index !== -1) {
          state.books[index] = action.payload;
          // Recalculate totals
          state.totalBooks = state.books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
          state.availableBooks = state.books.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
        }
      });
  }
});

export default bookSlice.reducer; 
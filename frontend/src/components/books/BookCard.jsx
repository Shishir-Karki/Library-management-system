const BookCard = ({ book }) => {
  return (
    <div className="border p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold">{book.title}</h2>
      <p className="text-sm text-gray-500">Author: {book.author}</p>
      <p className="text-sm text-gray-500">Genre: {book.genre}</p>
      <span className={`px-2 py-1 text-xs rounded-full ${book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {book.available ? 'Available' : 'Borrowed'}
      </span>
    </div>
  );
};

export default BookCard;
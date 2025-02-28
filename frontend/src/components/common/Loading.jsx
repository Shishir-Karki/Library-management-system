const Loading = ({ size = 'md', center = true }) => {
    const sizes = {
      sm: 'h-6 w-6',
      md: 'h-12 w-12',
      lg: 'h-16 w-16'
    };
  
    return (
      <div className={`${center ? 'flex justify-center items-center' : ''}`}>
        <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]}`}></div>
      </div>
    );
  };
  
  export default Loading;
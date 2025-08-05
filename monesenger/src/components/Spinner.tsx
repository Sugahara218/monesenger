export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
      sm: 'w-1 h-1 border-2',
      md: 'w-1 h-1 border-4',
      lg: 'w-1 h-1 border-4',
    };
  
    return (
      <div className="flex justify-center items-center p-4">
        <div
          className={`animate-spin rounded-full border-t-transparent border-solid border-blue-500 ${sizeClasses[size]}`}
        ></div>
      </div>
    );
  }



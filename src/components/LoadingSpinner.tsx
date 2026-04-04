import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Animated Logo/Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <div className="absolute inset-0 rounded-2xl border-4 border-white/30 animate-ping"></div>
          <div className="absolute inset-2 rounded-xl border-2 border-white/20"></div>
          <svg 
            className="w-12 h-12 text-white animate-pulse" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 animate-pulse">
          กำลังโหลดข้อมูลพื้นที่...
        </h1>
        
        <p className="text-gray-600 max-w-md">
          กำลังเตรียมข้อมูลสำหรับการแสดงผล กรุณารอสักครู่
        </p>
      </div>

      {/* Animated Progress Bar */}
      <div className="mt-12 w-full max-w-xs">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-blue-400 to-purple-500 rounded-full animate-loadingBar"></div>
        </div>
      </div>

      {/* Loading Dots */}
      <div className="mt-8 flex space-x-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Stats Preview (Skeleton) */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-12 max-w-md text-center">
        <p className="text-sm text-gray-500 italic">
          "ความเร็วขึ้นอยู่กับความเร็วอินเทอร์เน็ตของคุณ"
        </p>
      </div>

    
    </div>
  );
};

export default LoadingSpinner;
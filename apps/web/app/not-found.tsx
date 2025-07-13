import Link from "next/link";
import React from "react";
import { Music, Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Music Icon */}
        <div className="mb-8 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
          <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl opacity-0 animate-[bounceIn_0.8s_ease-out_forwards]">
            <Music size={48} className="text-white" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse"></div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back to discovering great music!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
          <Link href="/">
            <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
              <Home size={20} />
              <span>Go Home</span>
            </button>
          </Link>

          <Link href="/search">
            <button className="flex items-center space-x-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-600 transition-all duration-300 hover:scale-105 active:scale-95">
              <Search size={20} />
              <span>Discover Music</span>
            </button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-32 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-32 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-1500"></div>
      </div>
    </div>
  );
};

export default NotFound;

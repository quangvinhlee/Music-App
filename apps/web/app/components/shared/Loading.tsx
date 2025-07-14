"use client";
import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-blue-600">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full blur-md opacity-50 bg-blue-400 animate-ping" />
      </div>

      <div className="mt-6 text-lg font-semibold tracking-wide">
        Loading<span className="inline-block animate-bounce">.</span>
        <span className="inline-block animate-bounce delay-150">.</span>
        <span className="inline-block animate-bounce delay-300">.</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

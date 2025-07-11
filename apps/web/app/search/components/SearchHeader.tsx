"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for tracks, artists, or albums..."
            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/25 text-white placeholder-gray-400 hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-300"
          />
        </div>
      </form>

      {query && (
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold text-white">
            Search results for "{query}"
          </h1>
        </div>
      )}
    </div>
  );
}

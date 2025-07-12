"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for tracks, artists, or albums..."
              className="w-full pl-16 pr-6 py-5 bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/25 text-white placeholder-gray-400 hover:bg-gray-800/90 hover:border-gray-600 transition-all duration-300 text-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {query && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-3 rounded-full border border-purple-500/20">
            <Search className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">
              Results for "{query}"
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

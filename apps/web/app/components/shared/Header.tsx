"use client"; // Ensure this is a Client Component

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import Image from "next/image";
import { useLogout } from "app/query/useAuthQueries";
import { useSelector } from "react-redux";
import { RootState } from "app/store/store";
import { getAvatarColor, getInitials } from "app/utils";
import { Search, Home, User, LogOut, Settings, Heart } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Get user from Redux
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const { mutate: logoutMutation } = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check if we're on search page to hide search bar
  const isOnSearchPage = pathname === "/search";

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        // Redux state is already cleared in the mutation
        toast.success("Logout successful");
        router.push("/");
      },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const username = user?.username || "";
  const userInitials = getInitials(username);
  const avatarColor = getAvatarColor(username);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section: Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative overflow-hidden h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-1 mr-3 group-hover:scale-105 transition-all duration-300 shadow-lg">
              <Image
                src="/logo.png"
                alt="Music App Logo"
                width={32}
                height={32}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MusicApp
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                pathname === "/"
                  ? "text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg border border-purple-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home size={16} />
              <span>Home</span>
            </Link>

            <Link
              href="/search"
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                pathname === "/search"
                  ? "text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg border border-purple-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Search size={16} />
              <span>Discover</span>
            </Link>
          </nav>
        </div>

        {/* Center Section: Enhanced Search Bar */}
        {!isOnSearchPage && (
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div
                className={`relative flex items-center transition-all duration-300 ease-in-out ${
                  isFocused ? "transform scale-105" : ""
                }`}
              >
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200">
                  <Search size={18} />
                </div>

                {/* Search Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search songs, artists, albums..."
                  className={`
                    w-full pl-12 pr-20 py-3 text-sm
                    border-2 rounded-xl
                    bg-gray-800/50 backdrop-blur-sm
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:bg-gray-800/80 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/25
                    hover:bg-gray-800/60 hover:border-gray-600
                    text-white placeholder-gray-400
                    ${isFocused ? "border-purple-400 bg-gray-800/80 shadow-lg shadow-purple-500/25" : "border-gray-700"}
                  `}
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}

                {/* Search Button */}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer"
                >
                  <Search size={16} />
                </button>

                {/* Keyboard Shortcut Hint */}
                {!isFocused && !searchQuery && (
                  <div className="absolute right-14 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-600">
                    ⌘K
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Right Section: User Menu */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                  <Avatar
                    className="w-9 h-9 ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all duration-300"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-white font-semibold text-sm">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-sm border border-gray-700">
                <DropdownMenuLabel className="text-white font-semibold flex items-center space-x-2">
                  <User size={16} />
                  <span>My Account</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20 cursor-pointer flex items-center space-x-2">
                  <User size={16} />
                  <span>
                    <Link href="/me">Profile</Link>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20 cursor-pointer flex items-center space-x-2">
                  <Heart size={16} />
                  <span>Liked Songs</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20 cursor-pointer flex items-center space-x-2">
                  <Settings size={16} />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white hover:bg-red-600/20 cursor-pointer flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                pathname === "/auth/login"
                  ? "text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg border border-purple-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <User size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

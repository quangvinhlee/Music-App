"use client"; // Ensure this is a Client Component

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
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
import { logout } from "./store/auth";
import { toast } from "sonner";
import Image from "next/image";
import { useUser } from "app/query/useAuthQueries";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: user } = useUser();
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
    dispatch(logout());
    toast.success("Logout successful");
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

  const username = user?.username?.[0]?.toUpperCase();

  return (
    <header className="flex items-center justify-between p-2 bg-white text-black outline shadow-md">
      {/* Left Section: Logo, Home, and Search Bar */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <Link href="/" className="flex items-center overflow-hidden h-10 ml-12">
          <Image
            src="/logo.png"
            alt="Music App Logo"
            width={100}
            height={40}
            priority
            className="h-26 w-auto object-contain"
          />
        </Link>
        {/* Home Link */}
        <Link
          href="/"
          className={`hover:text-amber-200 text-base font-medium ${
            pathname === "/" ? "text-amber-200" : "text-black"
          }`}
        >
          Home
        </Link>

        {/* Enhanced Search Bar - Hide on search page */}
        {!isOnSearchPage && (
          <div className="relative group">
            <form onSubmit={handleSearch} className="relative">
              <div
                className={`relative flex items-center transition-all duration-300 ease-in-out ${
                  isFocused ? "transform scale-105" : ""
                }`}
              >
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200">
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
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
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
                    w-80 pl-10 pr-20 py-2.5 text-sm
                    border-2 rounded-full
                    bg-gray-50 
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:bg-white focus:border-amber-300 focus:shadow-lg focus:shadow-amber-100
                    hover:bg-white hover:border-gray-300
                    ${isFocused ? "border-amber-300 bg-white shadow-lg shadow-amber-100" : "border-gray-200"}
                  `}
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 transition-all duration-200 hover:scale-110"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>

                {/* Keyboard Shortcut Hint */}
                {!isFocused && !searchQuery && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded border">
                    ⌘K
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Right Section: Login/User Menu */}
      <div className="flex items-center space-x-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar
                asChild
                className="cursor-pointer w-10 h-10 bg-amber-300 mr-6"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <AvatarFallback className="text-white">
                    {username}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {/* Login link if not authenticated */}
        {!user && (
          <Link
            href="/auth/login"
            className={`hover:text-gray-300 ${
              pathname === "/auth/login" ? "text-amber-200" : "text-black"
            }`}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

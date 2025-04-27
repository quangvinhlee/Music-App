"use client"; // Ensure this is a Client Component

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
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

export default function Header() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth); // Access the user from the auth slice

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful");
  };

  const username = user?.username[0].toUpperCase();

  return (
    <header className="flex items-center justify-between p-2 bg-white text-black outline shadow-md">
      {/* Left Section: Logo, Home, and Search Bar */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <Link href="/" className="flex items-center overflow-hidden h-10 ml-12">
          <img
            src="/logo.png"
            alt="Music App Logo"
            className="h-26 w-auto object-contain" // Increased logo height
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
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer">
            🔍
          </button>
        </div>
      </div>

      {/* Right Section: Login/User Menu */}
      <div className="flex items-center space-x-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar asChild className="cursor-pointer w-8 h-8 bg-amber-300">
                <AvatarFallback className="text-white">
                  {username}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
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

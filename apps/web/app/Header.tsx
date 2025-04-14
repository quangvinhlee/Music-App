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

  return (
    <header className="flex items-center justify-between p-4 bg-white text-black outline shadow-md">
      <Link href="/" className="text-2xl font-bold ml-10">
        Music App
      </Link>
      <nav className="space-x-4">
        <Link
          href="/"
          className={`hover:text-amber-200 ${pathname === "/" ? "text-amber-200" : "text-black"}`}
        >
          Home
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar
                asChild
                className="cursor-pointer w-10 h-10  bg-amber-300"
              >
                <AvatarFallback className="text-white">
                  {user.username[0]}
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
            className={`hover:text-gray-300 ${pathname === "/auth/login" ? "text-amber-200" : "text-black"}`}
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

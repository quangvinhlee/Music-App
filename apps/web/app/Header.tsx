"use client"; // Ensure this is a Client Component

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between p-4 bg-white text-black outline shadow-md">
      <div className="text-2xl font-bold ml-10">Music App</div>
      <nav className="space-x-4">
        <Link
          href="/"
          className={`hover:text-amber-200 ${pathname === "/" ? "text-amber-200" : "text-black"}`}
        >
          Home
        </Link>
        <Link
          href="/auth/login"
          className={`hover:text-gray-300 ${pathname === "/auth/login" ? "text-amber-200" : "text-black"}`}
        >
          Login
        </Link>
      </nav>
    </header>
  );
}

"use client"; // Ensure this is a Client Component

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col space-y-10 justify-center m-10">
      <nav className="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
        <Link className="hover:text-gray-900" href="#">
          Home
        </Link>
        <Link className="hover:text-gray-900" href="#">
          About
        </Link>
        <Link className="hover:text-gray-900" href="#">
          Services
        </Link>
        <Link className="hover:text-gray-900" href="#">
          Media
        </Link>
        <Link className="hover:text-gray-900" href="#">
          Gallery
        </Link>
        <Link className="hover:text-gray-900" href="#">
          Contact
        </Link>
      </nav>

      <div className="flex justify-center space-x-5">
        <Link
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://img.icons8.com/fluent/30/000000/facebook-new.png"
            alt="Facebook"
            width={30}
            height={30}
          />
        </Link>
        <Link
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://img.icons8.com/fluent/30/000000/linkedin-2.png"
            alt="LinkedIn"
            width={30}
            height={30}
          />
        </Link>
        <Link
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://img.icons8.com/fluent/30/000000/instagram-new.png"
            alt="Instagram"
            width={30}
            height={30}
          />
        </Link>
        <Link
          href="https://messenger.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://img.icons8.com/fluent/30/000000/facebook-messenger--v2.png"
            alt="Messenger"
            width={30}
            height={30}
          />
        </Link>
        <Link
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://img.icons8.com/fluent/30/000000/twitter.png"
            alt="Twitter"
            width={30}
            height={30}
          />
        </Link>
      </div>

      <p className="text-center text-gray-700 font-medium">
        &copy; 2022 Company Ltd. All rights reserved.
      </p>
    </footer>
  );
}

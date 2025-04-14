import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 mt-32 ">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/">
        <span className="text-blue-500 underline cursor-pointer mt-4 inline-block">
          Go back to Home
        </span>
      </Link>
    </div>
  );
};

export default NotFound;

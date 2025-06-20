"use client";

import CommonForm from "@/components/CommonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { FaGoogle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/Loading";
import { useLogin } from "app/query/useAuthQueries";

const loginSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { isAuthenticated } = useSelector((state: any) => state.auth); // Access user state
  const { mutate: login, isPending: isLoading } = useLogin();

  const onSubmit = (data: { email: string; password: string }) => {
    setFormErrors({});
    login(data, {
      onSuccess: () => {
        toast.success("Login successful");
        router.push("/");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.";

        toast.error(message);

        // Associate the error with the 'password' field
        setFormErrors({ password: message });
      },
    });
  };

  const loginFields = [
    {
      name: "email",
      label: "Email",
      type: "text",
      placeholder: "Enter your email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
    },
  ];

  const extraFields = (
    <div className="flex justify-between text-sm">
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="h-4 w-4" />
        <span>Remember me</span>
      </label>
      <Link
        href="/auth/forgot-password"
        className="text-blue-500 hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  );

  return (
    <Card className="w-full max-w-lg p-10 mx-auto mt-12 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <CommonForm
          schema={loginSchema}
          onSubmit={onSubmit}
          fields={loginFields}
          button="Login"
          extraFields={extraFields}
          errors={formErrors}
          isLoading={isLoading}
        />
        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign up now
          </Link>
          .
        </p>

        <div className="flex justify-center">
          <Button
            className="mt-2 w-full max-w-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
            variant="link"
            onClick={() => console.log("Login with Google")}
          >
            <FaGoogle /> Login With Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

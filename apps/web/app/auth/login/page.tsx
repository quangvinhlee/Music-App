"use client";

import CommonForm from "@/components/CommonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "app/query/useAuthQueries";
import GoogleLoginButton from "../components/GoogleLoginButton";

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-lg p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600">Sign in to your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommonForm
            schema={loginSchema}
            onSubmit={onSubmit}
            fields={loginFields}
            button="Login"
            extraFields={extraFields}
            errors={formErrors}
            isLoading={isLoading}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLoginButton variant="login" />
          </div>

          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

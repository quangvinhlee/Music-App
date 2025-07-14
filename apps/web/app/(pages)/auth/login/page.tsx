"use client";

import CommonForm from "app/components/shared/CommonForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import Link from "next/link";
import { z } from "zod";
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
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
        setFormErrors({ password: message });
      },
    });
  };

  const loginFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-lg p-8 shadow-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
            <svg
              className="w-5 h-5 text-white"
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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-gray-300 text-sm">Sign in to your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommonForm
            schema={loginSchema}
            fields={loginFields}
            onSubmit={onSubmit}
            button={isLoading ? "Signing In..." : "Login"}
            isLoading={isLoading}
            errors={formErrors}
          />

          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 appearance-none bg-gray-800 border-2 border-gray-600 rounded focus:ring-2 focus:ring-purple-500/50 checked:bg-purple-500 checked:border-purple-500 checked:before:content-['✓'] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
              />
              <span className="text-gray-300 text-sm">Remember me</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-purple-400 hover:underline text-sm transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLoginButton variant="login" />
          </div>

          <p className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-purple-400 hover:underline font-semibold transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import CommonForm from "@/components/CommonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "app/query/useAuthQueries";
import GoogleLoginButton from "../components/GoogleLoginButton";

const signupSchema = z
  .object({
    email: z.string().email({
      message: "Invalid email address.",
    }),
    username: z.string().min(4, {
      message: "Username must be at least 4 characters.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { mutate: register, isPending: isLoading } = useRegister();

  const onSubmit = (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    setFormErrors({});
    register(data, {
      onSuccess: (result) => {
        toast.success(
          "Account created successfully! Please check your email for verification."
        );
        router.push(`/auth/verify?userId=${result.user.id}`);
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

  const signupFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "Enter your username",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm your password",
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Card className="w-full max-w-lg p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-1">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Join Us Today
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Create your account and start your journey
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommonForm
            schema={signupSchema}
            fields={signupFields}
            onSubmit={onSubmit}
            button={isLoading ? "Creating Account..." : "Sign Up"}
            isLoading={isLoading}
            errors={formErrors}
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
            <GoogleLoginButton variant="signup" />
          </div>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

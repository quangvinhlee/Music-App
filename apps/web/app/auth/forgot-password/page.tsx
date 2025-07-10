"use client";

import CommonForm from "@/components/CommonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForgotPassword } from "app/query/useAuthQueries";
import GoogleLoginButton from "../components/GoogleLoginButton";

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { mutate: forgotPassword, isPending: isLoading } = useForgotPassword();

  const onSubmit = (data: { email: string }) => {
    setFormErrors({});
    forgotPassword(data, {
      onSuccess: () => {
        toast.success("Password reset email sent successfully");
        router.push("/auth/login");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.";

        toast.error(message);
        setFormErrors({ email: message });
      },
    });
  };

  const forgotPasswordFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Card className="w-full max-w-lg p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-2">
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <p className="text-gray-600">
            Enter your email to receive reset instructions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommonForm
            schema={forgotPasswordSchema}
            fields={forgotPasswordFields}
            onSubmit={onSubmit}
            button={isLoading ? "Sending..." : "Send Reset Email"}
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
            <GoogleLoginButton variant="forgot" />
          </div>

          <p className="text-center text-gray-600">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

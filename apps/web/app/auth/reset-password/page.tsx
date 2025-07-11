"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import CommonForm from "@/components/CommonForm";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "app/query/useAuthQueries";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function ResetPasswordPageContent() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [resetSuccess, setResetSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate: resetPassword, isPending } = useResetPassword();

  const onSubmit = (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      setFormErrors({ token: "Token is required." });
      return;
    }
    setFormErrors({});
    resetPassword(
      { ...data, token },
      {
        onSuccess: () => {
          setResetSuccess(true);
          // toast.success("Password reset successful!");
        },
        onError: (err: any) => {
          let message = err?.message || "Failed to reset password.";
          setFormErrors({ password: message });
          toast.error(message);
        },
      }
    );
  };

  const resetPasswordFields = [
    {
      name: "password",
      label: "New Password",
      type: "password",
      placeholder: "Enter your new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      type: "password",
      placeholder: "Confirm your new password",
    },
  ];

  useEffect(() => {
    if (!token) {
      setFormErrors({ token: "Invalid or missing reset token." });
    }
  }, [token]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-lg p-8 shadow-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-xl">
        <CardHeader className="text-center space-y-3">
          {!resetSuccess && (
            <>
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
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
                    d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V9a6 6 0 10-12 0v1a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-2 0H8V9a4 4 0 118 0v1z"
                  />
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <p className="text-gray-300">Enter your new password below</p>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {resetSuccess ? (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
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
                    d="M16.707 8.293a1 1 0 00-1.414 0L10 13.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l6-6a1 1 0 000-1.414z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
                Password reset successful
              </h2>
              <p className="text-gray-300">
                Your password has been updated. You can now log in with your new
                password.
              </p>
              <p className="text-gray-400 text-sm mt-4">
                <a
                  href="/auth/login"
                  className="text-purple-400 hover:underline font-semibold transition-colors"
                >
                  Go to login
                </a>
              </p>
            </div>
          ) : (
            <CommonForm
              schema={resetPasswordSchema}
              onSubmit={onSubmit}
              fields={resetPasswordFields}
              button={isPending ? "Resetting..." : "Reset Password"}
              errors={formErrors}
              isLoading={isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}

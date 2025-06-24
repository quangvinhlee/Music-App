"use client";
import CommonForm from "@/components/CommonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useForgotPassword } from "app/query/useAuthQueries";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPassword() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState<boolean>(false); // New state for email sent confirmation
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const onSubmit = (data: { email: string }) => {
    setFormErrors({});
    forgotPassword(data, {
      onSuccess: (result) => {
        setEmailSent(true);
        toast.success("Password reset link sent to your email.");
      },
      onError: (err: any) => {
        const msg = err?.message || "Failed to send reset link";
        const errors: Record<string, string> = {};
        if (typeof msg === "string") {
          errors.email = msg;
        } else if (msg?.email) {
          errors.email = msg.email[0];
        } else {
          errors.email = "An unknown error occurred.";
        }
        setFormErrors(errors);
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      {/* Full-page message if email is sent */}
      {emailSent ? (
        <div className="text-center max-w-lg mx-auto p-16 bg-white shadow-md rounded-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-4">
            A password reset link has been sent to your email. Please check your
            inbox and follow the instructions to reset your password.
          </p>
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Return to Login
          </Link>
        </div>
      ) : (
        <Card className="w-full max-w-lg p-10 mx-auto mt-10 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Forgot Password
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Enter your email to receive a password reset code.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <CommonForm
              schema={forgotPasswordSchema}
              onSubmit={onSubmit}
              fields={[
                {
                  name: "email",
                  label: "Email",
                  type: "text",
                  placeholder: "Enter your email",
                },
              ]}
              button="Send Reset Link"
              errors={formErrors}
            />

            <div className="text-center text-sm text-gray-600 mt-4">
              Remembered your password?{" "}
              <Link
                href="/auth/login"
                className="text-blue-500 hover:underline"
              >
                Log in
              </Link>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                className="w-full max-w-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                variant="link"
                onClick={() => console.log("Login with Google")}
              >
                <FaGoogle className="mr-2" /> Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

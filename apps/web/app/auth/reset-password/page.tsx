"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import CommonForm from "@/components/CommonForm";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { resetPassword } from "app/store/auth"; // Your action to handle password reset
import { toast } from "sonner"; // To show toast messages

// Zod schema for validation
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

export default function ResetPasswordPage() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get the token from query params
  const dispatch = useDispatch();

  // This will be triggered when the form is submitted
  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      setFormErrors({ token: "Token is required." });
      return;
    }

    try {
      const response = await dispatch(resetPassword({ ...data, token })).then(
        (data) => {
          if (data.meta.requestStatus === "fulfilled") {
            return data.payload; // Assuming payload contains the response
          } else {
            const msg = data.payload || "Failed to reset password";
            const errors: Record<string, string> = {};
            if (typeof msg === "string") {
              errors.password = msg;
            } else if (msg.password) {
              errors.password = msg.password[0];
            } else {
              errors.password = "An unknown error occurred.";
            }
            setFormErrors(errors);
          }
        }
      );
    } catch (err) {
      console.error("Reset Password Error:", err);
      const errors: Record<string, string> = {};

      // Handling possible error messages from the backend response
      if (typeof err === "string") {
        errors.password = err; // If error is a string message
      } else if (err?.password) {
        errors.password = err.password[0]; // Assuming the error is an array of messages
      } else {
        errors.password = "An unknown error occurred."; // Default error message
      }

      setFormErrors(errors); // Update errors state to display in UI
      toast.error("An error occurred while resetting your password.");
    }
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
    <Card className="w-full max-w-lg p-10 mx-auto mt-20 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use CommonForm to render the form */}
        <CommonForm
          schema={resetPasswordSchema}
          onSubmit={onSubmit}
          fields={resetPasswordFields}
          button="Reset Password"
          errors={formErrors}
        />
      </CardContent>
    </Card>
  );
}

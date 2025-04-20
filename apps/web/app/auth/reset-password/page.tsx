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
      const result = await dispatch(resetPassword({ ...data, token }));

      console.log(result);

      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Password reset successful!");
      } else {
        const err = result?.payload;

        // Handle GraphQL error shape
        let message = "Failed to reset password.";
        if (err?.graphQLErrors?.[0]?.message) {
          message = err.graphQLErrors[0].message;
        } else if (typeof err === "string") {
          message = err;
        }

        setFormErrors({ password: message });
        toast.error(message);
      }
    } catch (err: any) {
      let message = "An unknown error occurred.";
      if (err?.graphQLErrors?.[0]?.message) {
        message = err.graphQLErrors[0].message;
      } else if (typeof err === "string") {
        message = err;
      }

      setFormErrors({ password: message });
      toast.error(message);
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

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import CommonForm from "@/components/CommonForm";
import { useSearchParams } from "next/navigation";

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
  const token = searchParams.get("token");

  const onSubmit = async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => {
    setFormErrors({}); // Clear any previous errors
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

  return (
    <Card className="w-full max-w-lg p-10 mx-auto mt-3 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
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

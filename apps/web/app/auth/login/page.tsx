"use client";

import CommonForm from "@/components/CommonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const onSubmit = (data: { username: string; password: string }) => {
    console.log("Form submitted:", data);
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
    <Card className="w-full max-w-sm p-10 mx-auto mt-12">
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
        />
        <div className="flex justify-center">
          <Button
            className="mt-2 w-full max-w-sm"
            variant="link"
            onClick={() => console.log("Login with Google")}
          >
            Login With Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

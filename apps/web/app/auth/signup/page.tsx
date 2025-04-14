"use client";

import CommonForm from "@/components/CommonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { FaGoogle } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "app/mutations/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LoadingSpinner from "@/components/Loading";

const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    username: z.string().min(4, {
      message: "Username is required and must at least 4 characters.",
    }),
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

export default function SignupPage() {
  const [register] = useMutation(SIGNUP_MUTATION);
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add loading state
  const { isAuthenticated } = useSelector((state: any) => state.auth); // Access user state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Redirect if user is already logged in
    if (isAuthenticated) {
      router.push("/"); // Use replace to prevent back navigation
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  if (isCheckingAuth) {
    return <LoadingSpinner />; // Render nothing while checking authentication
  }

  const onSubmit = async (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    setFormErrors({}); // Clear previous errors

    try {
      const response = await register({
        variables: {
          registerInput: {
            username: data.username,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
          },
        },
      });

      const result = response?.data?.register;

      if (result?.user) {
        toast.success(result.message);
        router.push(`/auth/verify?userId=${result.user.id}`);
      } else if (result?.message) {
        const msg = result.message.toLowerCase();
        const errors: Record<string, string> = {};

        if (msg.includes("email")) {
          errors.email = result.message;
        }
        if (msg.includes("username")) {
          errors.username = result.message;
        }

        setFormErrors(errors);
        toast.error(result.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const signupFields = [
    {
      name: "email",
      label: "Email",
      type: "text",
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
    <Card className="w-full max-w-lg p-10 mx-auto mt-3 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <CommonForm
          schema={signupSchema}
          onSubmit={onSubmit}
          fields={signupFields}
          button="Sign Up"
          errors={formErrors}
        />
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Sign In here
          </Link>
          .
        </p>

        <div className="flex justify-center">
          <Button
            className="mt-2 w-full max-w-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
            variant="link"
            onClick={() => console.log("Login with Google")}
          >
            <FaGoogle /> Sign Up With Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

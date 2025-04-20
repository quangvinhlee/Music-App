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
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "@/components/Loading";
import { registerUser } from "app/store/auth";

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
  const router = useRouter();
  const dispatch = useDispatch();
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
    try {
      dispatch(registerUser(data)).then((data) => {
        if (data.meta.requestStatus === "fulfilled") {
          toast.success("Register successfully!");
          router.push(`/auth/verify?userId=${data.payload.user.id}`);
        } else {
          const err =
            data?.payload?.graphQLErrors?.[0]?.message || data.error.message;
          setFormErrors({ form: err });
        }
      });
    } catch (error: any) {
      const err = error?.graphQLErrors?.[0]?.message || error.message;
      setFormErrors({ form: err });
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

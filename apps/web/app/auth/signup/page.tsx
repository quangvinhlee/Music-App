"use client";

import CommonForm from "@/components/CommonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { FaGoogle } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "app/mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signupSchema = z
  .object({
    email: z.string().email({
      message: "Invalid email address.",
    }),
    username: z.string().min(1, {
      message: "Username is required.",
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

  const onSubmit = async (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
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
      console.log("Registration response:", response);
      if (response.data.register) {
        toast.success("Registration successful!");
        const userId = response.data.register.user.id;
        router.push(`/auth/verify?userId=${userId}`);
      }
    } catch (err) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", err);
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
      placeholder: "Enter your password",
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

"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { RESEND_VERIFICATION_MUTATION } from "app/mutations/auth";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useCooldown } from "app/hooks/useCooldown";
import { useDispatch } from "react-redux";
import { resendVerification, verifyUser } from "app/store/auth";
import Link from "next/link";
import { FaUserFriends } from "react-icons/fa";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false); // ✅ new state
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();
  const dispatch = useDispatch();

  const { isResendDisabled, timeRemaining, resetCooldown } = useCooldown();

  const handleVerifyButton = async (data: {
    userId: string;
    verificationCode: string;
  }) => {
    try {
      const response = await dispatch(verifyUser(data)).unwrap();
      toast.success(response.message);
      setVerificationSuccess(true); // ✅ show success screen
    } catch (error: any) {
      console.error("Verification Error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.error?.message ||
            "Verification failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleResendButton = async (userId: string) => {
    try {
      const data = await dispatch(resendVerification({ userId })).unwrap();

      toast.success(data.message || "Verification code resent successfully.");
      resetCooldown();
    } catch (error: any) {
      console.error("Resend Verification Error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.error?.message ||
            "Failed to resend verification code.";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (!userId) {
      router.push("/auth/signup");
    }
  }, [userId, router]);

  // ✅ If verified, show success screen
  if (verificationSuccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-lg mx-auto p-16 bg-white shadow-md rounded-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Verification Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your account has been verified. You can now log in.
          </p>
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Normal OTP input screen
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-xl p-10 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            Verify Your Account
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Enter the 6-digit OTP sent to your email
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="gap-4">
                {[...Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-14 h-14 text-2xl border-2 rounded-md"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full h-14 text-lg cursor-pointer"
            onClick={() =>
              handleVerifyButton({
                userId: userId as string,
                verificationCode: otp,
              })
            }
          >
            Verify
          </Button>

          <p className="text-center text-lg">
            Didn’t receive the code?{" "}
            <button
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => handleResendButton(userId as string)}
              disabled={isResendDisabled}
            >
              {isResendDisabled
                ? `Resend in ${Math.ceil(timeRemaining / 1000)}s`
                : "Resend Verification Code"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useSearchParams, useRouter } from "next/navigation"; // Updated import
import { toast } from "sonner";
import {
  RESEND_VERIFICATION_MUTATION,
  VERIFY_USER_MUTATION,
} from "app/mutations/auth";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useCooldown } from "app/hooks/useCooldown";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter(); // Updated usage

  const { isResendDisabled, timeRemaining, resetCooldown } = useCooldown();

  const [resendVerification] = useMutation(RESEND_VERIFICATION_MUTATION);
  const [verifyUser] = useMutation(VERIFY_USER_MUTATION);

  const handleVerifyButton = async () => {
    try {
      const response = await verifyUser({
        variables: {
          verifyUserInput: {
            userId: userId,
            verificationCode: otp,
          },
        },
      });

      console.log("Verification response:", response);
      toast.success(response?.data?.verifyUser?.message); // Show success toast
    } catch (error: any) {
      console.log(error);

      const errorMessage =
        error?.graphQLErrors?.[0]?.message ||
        "Verification failed. Please try again.";

      // Show the error message as a toast
      toast.error(errorMessage);
    }
  };

  const handleResendButton = async () => {
    try {
      const response = await resendVerification({
        variables: {
          resendVerificationInput: {
            userId: userId,
            type: "register",
          },
        },
      });

      toast.success(response.data.resendVerification.message);
      resetCooldown(); // reset cooldown timer
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Error resending verification code");
    }
  };

  useEffect(() => {
    if (!userId) {
      router.push("/auth/signup");
    }
  }, [userId, router]);

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
            onClick={handleVerifyButton}
          >
            Verify
          </Button>

          <p className="text-center text-lg">
            Didn’t receive the code?{" "}
            <button
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={handleResendButton}
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

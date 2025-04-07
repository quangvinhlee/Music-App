"use client";

import { useState, useEffect } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { RESEND_VERIFICATION_MUTATION } from "app/mutations";
import { toast } from "sonner";

// Time in milliseconds for cooldown (1 minute = 60,000ms)
const COOLDOWN_TIME = 60000;

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(COOLDOWN_TIME);

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [resendVerification] = useMutation(RESEND_VERIFICATION_MUTATION);

  // Check if the button should be disabled on page load (from localStorage)
  useEffect(() => {
    const lastResendTime = localStorage.getItem("lastResendTime");
    if (lastResendTime) {
      const elapsedTime = Date.now() - Number(lastResendTime);
      if (elapsedTime < COOLDOWN_TIME) {
        const remainingTime = COOLDOWN_TIME - elapsedTime;
        setIsResendDisabled(true);
        setTimeRemaining(remainingTime);
      }
    }
  }, []);

  useEffect(() => {
    // Update the time remaining for the button to become active again
    if (isResendDisabled && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1000) {
            setIsResendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isResendDisabled, timeRemaining]);

  // Resend button click handler
  async function handleResendButton(): Promise<void> {
    try {
      const response = await resendVerification({
        variables: {
          resendVerificationInput: {
            userId: userId,
            type: "register",
          },
        },
      });

      // Store the current time in localStorage when the button is clicked
      localStorage.setItem("lastResendTime", Date.now().toString());

      // Disable the resend button for 1 minute
      setIsResendDisabled(true);
      setTimeRemaining(COOLDOWN_TIME); // Reset the countdown to 1 minute
      toast.success(response.data.resendVerification.message);
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Error resending verification code");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen ">
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

          <Button className="w-full h-14 text-lg">Verify</Button>

          <p className="text-center text-lg">
            Didn’t receive the code?{" "}
            <button
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => handleResendButton()}
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

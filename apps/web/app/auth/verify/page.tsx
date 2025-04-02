"use client";

import { useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");

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
            Didn't receive the code?{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">
              Resend Verification Code
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

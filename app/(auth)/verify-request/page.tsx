"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

export default function page() {
  const params = useSearchParams();

  const email = params.get("email") as string;
  const [otp, setOtp] = useState("");

  const router = useRouter();

  const [otpPending, startTransation] = useTransition();

  const isOtpCompeled = otp.length === 6;

  function verifyOtp() {
    startTransation(async () => {
      await authClient.signIn.emailOtp({
        email,
        otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("email verified");
            router.push("/");
          },
          onError: () => {
            toast.error("Error verifing Email/OTP");
          },
        },
      });
    });
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          We send a verification email code to your email address. Please open
          the email and paste the code below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(val) => setOtp(val)}
            className="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enterthe 6-digit code send to your email
          </p>
        </div>
        <Button
          disabled={otpPending || !isOtpCompeled}
          onClick={verifyOtp}
          className="w-full"
        >
          {otpPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading ...</span>
            </>
          ) : (
            "Verify Account"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

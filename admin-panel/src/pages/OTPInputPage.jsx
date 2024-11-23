import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL;

export function OTPInputPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [timer, setTimer] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (otp) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
          email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        navigate("/reset-password", { state: { email, otp } });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTimer(300);
      setValue("");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md border-none shadow-none">
      <CardHeader className="space-y-4">
        <div className="relative text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-0 h-8 w-8"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold uppercase">
            Enter OTP
          </CardTitle>
        </div>
        <CardDescription className="text-gray-500">
          Enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            value={value}
            onChange={setValue}
            maxLength={6}
            onComplete={handleComplete}
            disabled={isLoading}
            className="gap-2"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-500">
            Time remaining: {formatTime(timer)}
          </p>
          {timer === 0 && (
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700"
              onClick={handleResendOTP}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-2">
        <Button
          variant="link"
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}

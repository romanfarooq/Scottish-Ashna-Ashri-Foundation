import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = (data) => {
    console.log("Login Data:", data);
  };

  return (
    <Card className="w-full max-w-md border-none bg-inherit shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold uppercase text-gray-800">
          Admin Login
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-3 pt-0">
        <form onSubmit={handleSubmit(handleLogin)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-2 flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={cn(
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "",
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 flex items-center">
                <Lock className="mr-2 h-4 w-4 text-gray-500" />
                Password
              </Label>
              <div className="relative">
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={cn(
                      "pr-10",
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button className="w-full transition-colors" type="submit">
              Sign In
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          className="h-full p-0 text-sm text-gray-500 hover:text-gray-700"
          onClick={() =>
            navigate("/forgot-password", {
              state: {
                email: watch("email"),
              },
            })
          }
        >
          Forgot Password?
        </Button>
      </CardFooter>
    </Card>
  );
}

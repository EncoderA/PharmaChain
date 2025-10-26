"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirm-password") as string,
    };

    try {
      // Add your authentication logic here
      if (isSignup) {
        // Signup logic
        console.log("Signing up:", data);
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
          alert("Passwords don't match!");
          return;
        }
      } else {
        // Login logic
        console.log("Logging in:", { email: data.email, password: data.password });
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle successful authentication
      console.log(isSignup ? "Signup successful!" : "Login successful!");

    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isSignup ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? "Sign up with your Apple or Google account"
              : "Login with your Apple or Google account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3">
              {/* Google Login */}
              <div className="flex flex-col gap-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  type="button"
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 mr-2"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isSignup ? "Sign up with Google" : "Login with Google"}
                </Button>
              </div>

              {/* Divider */}
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6">
                {isSignup && (
                  <div className="grid gap-3">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required={isSignup}
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {!isSignup && (
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    )}
                  </div>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    disabled={isLoading}
                    minLength={isSignup ? 6 : undefined}
                  />
                  {isSignup && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
                {isSignup && (
                  <div className="grid gap-3">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      placeholder="Re-enter your password"
                      required={isSignup}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {isSignup ? "Creating account..." : "Logging in..."}
                    </>
                  ) : (
                    isSignup ? "Sign Up" : "Login"
                  )}
                </Button>
              </div>

            
              <div className="text-center text-sm">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignup(false)}
                      className="underline underline-offset-4 text-primary"
                      disabled={isLoading}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignup(true)}
                      className="underline underline-offset-4 text-primary"
                      disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
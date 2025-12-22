import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle2,
  KeyRound,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/types/auth.types";
import { cn } from "@/lib/utils";

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      // Use centralized error message handler for user-friendly messages
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(submittedEmail);
    } catch (err) {
      // Use centralized error message handler for user-friendly messages
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnother = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    setError(null);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
              {/* Left Side - Branding */}
              <div className="hidden lg:flex flex-col justify-center space-y-8">
                {/* Logo */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative inline-flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                      <Heart className="h-8 w-8 text-white" fill="currentColor" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Doctaura
                      </h1>
                      <p className="text-muted-foreground">Healthcare Reimagined</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    Forgot your password?
                    <span className="block text-primary">No worries!</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md">
                    It happens to the best of us. Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Enter your email</p>
                      <p className="text-sm text-muted-foreground">The one you used to sign up</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Check your inbox</p>
                      <p className="text-sm text-muted-foreground">We'll send a secure reset link</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Create new password</p>
                      <p className="text-sm text-muted-foreground">Choose a strong, unique password</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form/Success */}
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

                  <CardContent className="p-8">
                    {/* Success State */}
                    {isSuccess ? (
                      <div className="text-center space-y-6 animate-in fade-in-0 zoom-in-95">
                        {/* Success Icon */}
                        <div className="relative mx-auto w-20 h-20">
                          <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
                          <div className="relative w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                            <Inbox className="h-10 w-10 text-accent" />
                          </div>
                        </div>

                        {/* Success Message */}
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
                          <p className="text-muted-foreground">
                            We've sent a password reset link to
                          </p>
                          <p className="font-medium text-primary">{submittedEmail}</p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
                          <p className="text-sm text-foreground font-medium">What's next?</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              Open the email we just sent
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              Click the reset link (expires in 24h)
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              Create your new password
                            </li>
                          </ul>
                        </div>

                        {/* Error in Success State */}
                        {error && (
                          <Alert variant="destructive" className="animate-in fade-in-0">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={handleResend}
                            disabled={isLoading}
                            className="w-full h-12"
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Resend Email
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={handleTryAnother}
                            className="w-full h-12"
                          >
                            Try a Different Email
                          </Button>
                        </div>

                        {/* Spam Note */}
                        <p className="text-xs text-muted-foreground">
                          Didn't receive the email? Check your spam folder or{" "}
                          <button
                            onClick={handleResend}
                            className="text-primary hover:underline"
                          >
                            resend it
                          </button>
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Form State */}
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                            <KeyRound className="h-7 w-7 text-white" />
                          </div>
                          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
                          <p className="text-muted-foreground mt-1">We'll help you get back in</p>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:block mb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <KeyRound className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                              <p className="text-sm text-muted-foreground">Enter your email to continue</p>
                            </div>
                          </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                          <Alert variant="destructive" className="mb-6 animate-in fade-in-0 slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                          {/* Email Field */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                              Email Address
                            </Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoFocus
                                className={cn(
                                  "pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all",
                                  errors.email && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...register("email")}
                              />
                              {emailValue && !errors.email && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent animate-in fade-in-0 zoom-in-50" />
                              )}
                            </div>
                            {errors.email && (
                              <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                {errors.email.message}
                              </p>
                            )}
                          </div>

                          {/* Submit Button */}
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-base font-semibold gradient-hero text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Send Reset Link
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-6">
                          <Link to="/login">
                            <Button
                              variant="ghost"
                              className="w-full h-12 text-muted-foreground hover:text-foreground"
                            >
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back to Sign In
                            </Button>
                          </Link>
                        </div>

                        {/* Security Note */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          <span>We never share your email with third parties</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Help Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need help?{" "}
                    <Link to="/contact" className="text-primary font-medium hover:underline">
                      Contact Support
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;

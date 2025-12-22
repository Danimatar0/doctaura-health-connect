import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  Sparkles,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/types/auth.types";
import { cn } from "@/lib/utils";

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from location state
  const from = (location.state as { from?: string })?.from || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(data.email, data.password, data.rememberMe);
      
      // Check if email is verified
      if (!user.emailVerified) {
        navigate("/verify-email", { state: { email: user.email } });
        return;
      }

      // Navigate to the appropriate dashboard or the page they were trying to access
      const redirectPath = from || authService.getDashboardUrl(user.role);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      // Use centralized error message handler for user-friendly messages
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: "Enterprise-grade security" },
    { icon: Activity, text: "Real-time health tracking" },
    { icon: Sparkles, text: "AI-powered insights" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
              {/* Left Side - Branding */}
              <div className="hidden lg:flex flex-col justify-center space-y-8">
                {/* Animated Logo */}
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

                {/* Welcome Message */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    Welcome back to your
                    <span className="block text-primary">health journey</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md">
                    Access your medical records, book appointments, and connect with healthcare professionals - all in one place.
                  </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm"
                    >
                      <feature.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">10,000+</span>
                    <span className="text-muted-foreground"> patients trust us</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

                  <CardContent className="p-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                        <Heart className="h-7 w-7 text-white" fill="currentColor" />
                      </div>
                      <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                      <p className="text-muted-foreground mt-1">Sign in to continue</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-8">
                      <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
                      <p className="text-muted-foreground mt-1">
                        Enter your credentials to access your account
                      </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <Alert variant="destructive" className="mb-6 animate-in fade-in-0 slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Login Form */}
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

                      {/* Password Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium">
                            Password
                          </Label>
                          <Link
                            to="/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className={cn(
                              "pl-10 pr-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all",
                              errors.password && "border-destructive focus-visible:ring-destructive"
                            )}
                            {...register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="rememberMe"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="rememberMe"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          )}
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          Remember me for 30 days
                        </Label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-base font-semibold gradient-hero text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-70"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-card text-muted-foreground">
                          New to Doctaura?
                        </span>
                      </div>
                    </div>

                    {/* Register Link */}
                    <Link to="/register">
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base font-medium border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all"
                      >
                        Create an Account
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Security Note */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Protected by enterprise-grade encryption</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

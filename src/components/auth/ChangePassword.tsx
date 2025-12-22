import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  KeyRound,
} from "lucide-react";
import { authService } from "@/services/authService";
import { AuthError } from "@/types/auth.types";
import { cn } from "@/lib/utils";

// Form validation schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordProps {
  onSuccess?: () => void;
  className?: string;
}

const ChangePassword = ({ onSuccess, className }: ChangePasswordProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const watchNewPassword = watch("newPassword");

  // Calculate password strength
  useEffect(() => {
    if (!watchNewPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (watchNewPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(watchNewPassword)) strength += 25;
    if (/[a-z]/.test(watchNewPassword)) strength += 25;
    if (/[0-9]/.test(watchNewPassword)) strength += 15;
    if (/[^A-Za-z0-9]/.test(watchNewPassword)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  }, [watchNewPassword]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-destructive";
    if (passwordStrength < 60) return "bg-yellow-500";
    if (passwordStrength < 80) return "bg-accent";
    return "bg-primary";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return "Weak";
    if (passwordStrength < 60) return "Fair";
    if (passwordStrength < 80) return "Good";
    return "Strong";
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.changePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmNewPassword
      );
      setSuccess(true);
      reset();
      onSuccess?.();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("shadow-soft border-border/50", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 bg-accent/10 border-accent/30 animate-in fade-in-0 slide-in-from-top-1">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent">
              Password changed successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in-0 slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Password Field */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                className={cn(
                  "pl-10 pr-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-all",
                  errors.currentPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={cn(
                  "pl-10 pr-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-all",
                  errors.newPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {watchNewPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all",
                        passwordStrength >= i * 25 ? getPasswordStrengthColor() : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <p
                  className={cn(
                    "text-xs",
                    passwordStrength < 60 ? "text-yellow-500" : "text-accent"
                  )}
                >
                  Password strength: {getPasswordStrengthText()}
                </p>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className={cn(
                  "pl-10 pr-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-all",
                  errors.confirmNewPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("confirmNewPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-base font-semibold gradient-hero text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Update Password
              </>
            )}
          </Button>
        </form>

        {/* Password Requirements */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-sm font-medium text-foreground mb-3">Password Requirements:</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  watchNewPassword && watchNewPassword.length >= 8
                    ? "text-accent"
                    : "text-muted-foreground"
                )}
              />
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  watchNewPassword && /[A-Z]/.test(watchNewPassword)
                    ? "text-accent"
                    : "text-muted-foreground"
                )}
              />
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  watchNewPassword && /[a-z]/.test(watchNewPassword)
                    ? "text-accent"
                    : "text-muted-foreground"
                )}
              />
              One lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  watchNewPassword && /[0-9]/.test(watchNewPassword)
                    ? "text-accent"
                    : "text-muted-foreground"
                )}
              />
              One number
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;

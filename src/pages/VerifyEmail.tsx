import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Clock,
  ExternalLink,
} from "lucide-react";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface LocationState {
  email?: string;
  isNewRegistration?: boolean;
}

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const email = state?.email || "";
  const isNewRegistration = state?.isNewRegistration || false;

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await authService.resendVerificationEmail();
      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      // Use centralized error message handler for user-friendly messages
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    authService.clearSession();
    navigate("/login");
  };

  // Common email providers for quick links
  const emailProviders = [
    { name: "Gmail", domain: "gmail.com", url: "https://mail.google.com" },
    { name: "Outlook", domain: "outlook.com", url: "https://outlook.live.com" },
    { name: "Yahoo", domain: "yahoo.com", url: "https://mail.yahoo.com" },
  ];

  const getEmailProvider = () => {
    if (!email) return null;
    const domain = email.split("@")[1]?.toLowerCase();
    return emailProviders.find((p) => domain?.includes(p.domain.split(".")[0]));
  };

  const emailProvider = getEmailProvider();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  {/* Animated Mail Icon */}
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Mail className="h-12 w-12 text-primary" />
                    </div>
                    {/* Envelope animation hint */}
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center animate-bounce">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {isNewRegistration ? "Verify Your Email" : "Email Verification Required"}
                  </h1>
                  <p className="text-muted-foreground">
                    {isNewRegistration
                      ? "We've sent a verification link to your email"
                      : "Please verify your email to continue"}
                  </p>
                </div>

                {/* Email Display */}
                {email && (
                  <div className="bg-muted/50 rounded-xl p-4 mb-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Sent to:</p>
                    <p className="font-medium text-foreground break-all">{email}</p>
                  </div>
                )}

                {/* Success Message */}
                {resendSuccess && (
                  <Alert className="mb-6 bg-accent/10 border-accent/30 animate-in fade-in-0 slide-in-from-top-1">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-accent">
                      Verification email sent successfully! Check your inbox.
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

                {/* Instructions */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Check your inbox</p>
                      <p className="text-sm text-muted-foreground">
                        Look for an email from Doctaura
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Click the verification link</p>
                      <p className="text-sm text-muted-foreground">
                        The link will expire in 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Start using Doctaura</p>
                      <p className="text-sm text-muted-foreground">
                        Access all features after verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Email Link */}
                {emailProvider && (
                  <a
                    href={emailProvider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-6"
                  >
                    <Button
                      variant="default"
                      className="w-full h-12 text-base gradient-hero text-white shadow-lg shadow-primary/25"
                    >
                      Open {emailProvider.name}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}

                {/* Resend Button */}
                <Button
                  variant={emailProvider ? "outline" : "default"}
                  onClick={handleResendVerification}
                  disabled={isLoading || countdown > 0}
                  className={cn(
                    "w-full h-12 mb-4",
                    !emailProvider && "gradient-hero text-white shadow-lg shadow-primary/25"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="mr-2 h-5 w-5" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                {/* Back to Login */}
                <Button
                  variant="ghost"
                  onClick={handleBackToLogin}
                  className="w-full h-12 text-muted-foreground hover:text-foreground"
                >
                  Back to Sign In
                </Button>

                {/* Tips Section */}
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Didn't receive the email?
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      Check your spam or junk folder
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      Make sure {email || "your email"} is correct
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      Add noreply@doctaura.com to contacts
                    </li>
                  </ul>
                </div>

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secure verification powered by Doctaura</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Having trouble?{" "}
                <Link to="/contact" className="text-primary font-medium hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmail;

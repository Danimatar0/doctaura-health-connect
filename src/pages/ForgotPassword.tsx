import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, ArrowRight, KeyRound, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { keycloakService } from "@/services/keycloakService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    // Redirect to Keycloak password reset page
    await keycloakService.requestPasswordReset({ email: '' });
  };

  const steps = [
    {
      icon: Mail,
      title: "Verify Your Identity",
      description: "You'll be redirected to Keycloak to verify your email address",
    },
    {
      icon: KeyRound,
      title: "Reset Link Sent",
      description: "Check your inbox for a secure password reset link",
    },
    {
      icon: CheckCircle2,
      title: "Create New Password",
      description: "Follow the link to set up your new secure password",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>

            {/* Logo and Welcome */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Heart className="h-10 w-10 text-primary" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Reset Your Password</h1>
              <p className="text-lg text-muted-foreground">
                Securely reset your password through Keycloak
              </p>
            </div>

            {/* Main Card */}
            <Card className="shadow-soft mb-8">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Password Recovery Process</CardTitle>
                <CardDescription className="text-base mt-2">
                  We'll guide you through a secure password reset process
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Steps */}
                <div className="space-y-6 mb-8">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {index + 1}. {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleResetPassword}
                  size="lg"
                  className="w-full gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth text-lg h-14"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Continue to Keycloak
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="shadow-soft border-primary/20 mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Secure & Safe</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password reset is handled by Keycloak using industry-standard security protocols.
                      The reset link will expire after a short period for your protection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="shadow-soft bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-center mb-4">Need Additional Help?</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-background">
                    <p className="text-sm font-medium mb-2">Don't have access to your email?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/contact")}
                    >
                      Contact Support
                    </Button>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background">
                    <p className="text-sm font-medium mb-2">Remember your password?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/login")}
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;

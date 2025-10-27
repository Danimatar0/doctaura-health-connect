import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, UserCircle, Stethoscope, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { keycloakService } from "@/services/keycloakService";
import { UserRole } from "@/types/auth.types";
import { env } from "@/config/env";

const Register = () => {
  const navigate = useNavigate();

  // Get registration strategy from config
  const registrationStrategy = env.features.registrationStrategy;

  // Handle role card click - redirects immediately to Keycloak with selected role
  const handleRoleCardClick = (selectedRole: UserRole) => {
    if (registrationStrategy === "webapp") {
      // Pass the selected role to Keycloak
      keycloakService.redirectToRegister(selectedRole);
    } else {
      // Scenario 2: Keycloak theme handles role selection
      // Don't pass role, let Keycloak theme handle it
      keycloakService.redirectToRegister();
    }
  };

  // For Keycloak strategy - single register button
  const handleRegister = () => {
    keycloakService.redirectToRegister();
  };

  const patientBenefits = [
    "Book appointments with verified doctors",
    "Access your medical records anytime",
    "Find pharmacies with your prescriptions",
    "Manage your health history securely",
  ];

  const doctorBenefits = [
    "Manage patient appointments efficiently",
    "Access comprehensive patient records",
    "Expand your practice reach",
    "Streamline healthcare delivery",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Logo and Welcome */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Heart className="h-10 w-10 text-primary" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Join Doctaura Today</h1>
              <p className="text-lg text-muted-foreground">
                Create your account with secure Keycloak authentication
              </p>
            </div>

            {/* Role Selection Cards - Only shown in "webapp" strategy (Scenario 1) */}
            {registrationStrategy === "webapp" && (
              <div className="mb-8">
                <h2 className="text-center text-lg font-medium mb-6">Choose your account type</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Card */}
                <Card
                  className="cursor-pointer transition-all hover:shadow-hover hover:ring-2 hover:ring-primary shadow-soft"
                  onClick={() => handleRoleCardClick("patient")}
                >
                  <CardHeader>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white">
                        <UserCircle className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Patient Account</CardTitle>
                        <CardDescription className="mt-2">
                          For individuals seeking healthcare services
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {patientBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Doctor Card */}
                <Card
                  className="cursor-pointer transition-all hover:shadow-hover hover:ring-2 hover:ring-primary shadow-soft"
                  onClick={() => handleRoleCardClick("doctor")}
                >
                  <CardHeader>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white">
                        <Stethoscope className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Doctor Account</CardTitle>
                        <CardDescription className="mt-2">
                          For healthcare professionals providing services
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {doctorBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              </div>
            )}

            {/* Keycloak Theme Strategy Info and Button - Only shown in "keycloak" strategy (Scenario 2) */}
            {registrationStrategy === "keycloak" && (
              <>
                <div className="mb-8">
                  <Card className="shadow-soft border-primary/20 max-w-2xl mx-auto">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-8 w-8 text-primary" />
                          </div>
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Choose between <span className="font-medium text-foreground">Patient</span> or{" "}
                          <span className="font-medium text-foreground">Doctor</span> account during registration.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Register Button - Only for Keycloak strategy */}
                <div className="text-center mb-8">
                  <Button
                    onClick={handleRegister}
                    size="lg"
                    className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth px-12 text-lg h-14"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Create Account with Keycloak
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-soft border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Enterprise Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Your data is protected with Keycloak's industry-leading security standards and encryption.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Quick Setup</h3>
                      <p className="text-sm text-muted-foreground">
                        Register in minutes and start accessing healthcare services immediately.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </div>

              {/* Doctor verification notice */}
              <Card className="shadow-soft bg-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">Note:</span>{" "}
                    Doctors will need to submit their medical credentials for verification before accessing the doctor portal.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;

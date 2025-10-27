import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart, UserCircle, Stethoscope, Shield, ArrowRight } from "lucide-react";
import { keycloakService } from "@/services/keycloakService";
import { UserRole } from "@/types/auth.types";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("patient");

  const handleLogin = () => {
    // Redirect to Keycloak login page
    keycloakService.redirectToLogin(role);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Logo and Welcome */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Heart className="h-10 w-10 text-primary" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Welcome Back to Doctaura</h1>
              <p className="text-lg text-muted-foreground">
                Sign in securely to your account
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="mb-8">
              <h2 className="text-center text-lg font-medium mb-6">Select your account type</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-hover ${
                    role === "patient" ? "ring-2 ring-primary shadow-hover" : "shadow-soft"
                  }`}
                  onClick={() => setRole("patient")}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        role === "patient" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                      }`}>
                        <UserCircle className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Patient Portal</h3>
                        <p className="text-sm text-muted-foreground">
                          Book appointments, manage medical records, and connect with healthcare providers
                        </p>
                      </div>
                      <RadioGroup value={role} className="opacity-0 h-0">
                        <RadioGroupItem value="patient" />
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Doctor Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-hover ${
                    role === "doctor" ? "ring-2 ring-primary shadow-hover" : "shadow-soft"
                  }`}
                  onClick={() => setRole("doctor")}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        role === "doctor" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                      }`}>
                        <Stethoscope className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Doctor Portal</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage appointments, patient records, and provide quality healthcare services
                        </p>
                      </div>
                      <RadioGroup value={role} className="opacity-0 h-0">
                        <RadioGroupItem value="doctor" />
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Login Button */}
            <div className="text-center mb-8">
              <Button
                onClick={handleLogin}
                size="lg"
                className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth px-12 text-lg h-14"
              >
                <Shield className="h-5 w-5 mr-2" />
                Continue to Doctaura
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Info Card */}
            <Card className="shadow-soft border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Enterprise-Grade Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Your credentials are protected with industry-leading security standards and encryption.
                      We never store your password.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-6 text-sm">
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary font-medium hover:underline"
                >
                  Create an account
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
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

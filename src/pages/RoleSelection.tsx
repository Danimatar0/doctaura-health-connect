import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  User,
  Stethoscope,
  Users,
  ArrowRight,
  CheckCircle2,
  Shield,
} from "lucide-react";
import type { RegistrationRole } from "@/types/registration.types";

interface RoleOption {
  role: RegistrationRole;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  route: string;
  color: string;
  bgColor: string;
}

const roleOptions: RoleOption[] = [
  {
    role: "patient",
    title: "Patient",
    description: "Access healthcare services, book appointments, and manage your health records",
    icon: User,
    features: [
      "Book appointments with doctors",
      "Access your medical records",
      "Find pharmacies nearby",
      "Video consultations",
    ],
    route: "/register/patient",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    role: "doctor",
    title: "Doctor",
    description: "Join our network of healthcare professionals and reach more patients",
    icon: Stethoscope,
    features: [
      "Manage your practice online",
      "Connect with patients",
      "Digital prescriptions",
      "Flexible scheduling",
    ],
    route: "/register/doctor",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    role: "staff",
    title: "Medical Staff",
    description: "Support healthcare delivery as part of a clinic or doctor's team",
    icon: Users,
    features: [
      "Manage appointments",
      "Patient coordination",
      "Administrative support",
      "Team collaboration",
    ],
    route: "/register/staff",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6">
                <Heart className="h-8 w-8 text-white" fill="currentColor" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Join Doctaura Today
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose how you want to be part of our healthcare community. Select the role that best describes you.
              </p>
            </div>

            {/* Role Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {roleOptions.map((option) => (
                <Card
                  key={option.role}
                  className="relative overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleRoleSelect(option.route)}
                >
                  {/* Gradient top border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${option.bgColor} mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <option.icon className={`h-7 w-7 ${option.color}`} />
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {option.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features List */}
                    <ul className="space-y-2">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`h-4 w-4 ${option.color} shrink-0`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className="w-full mt-4 group-hover:gradient-hero group-hover:text-white transition-all"
                      variant="outline"
                    >
                      Register as {option.title}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Staff Note */}
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Medical Staff Registration
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Staff registration requires an invitation code from a registered doctor or clinic.
                    If you don't have one, please contact your employer.
                  </p>
                </div>
              </div>
            </div>

            {/* Already have an account */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
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

export default RoleSelection;

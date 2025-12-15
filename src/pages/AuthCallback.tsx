import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { keycloakService } from "@/services/keycloakService";
import { patientDataService, convertAuthUserToPatientRequest } from "@/services/patientDataService";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2 } from "lucide-react";
import { AuthError } from "@/types/auth.types";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle error from Keycloak
      if (error) {
        setStatus("error");
        toast({
          title: "Authentication Failed",
          description: errorDescription || "An error occurred during authentication",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      // Handle missing code
      if (!code) {
        setStatus("error");
        toast({
          title: "Invalid Request",
          description: "Authorization code is missing",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        // Get OAuth state BEFORE handleCallback clears it
        const oauthState = keycloakService.getOAuthState();
        const isNewRegistration = oauthState?.isNewRegistration === true;

        // Exchange code for tokens
        const user = await keycloakService.handleCallback(code, state || undefined);

        // Check if this is a new patient registration
        const isPatient = user.role === "patient";

        // If this is a new patient registration, create patient record in backend
        if (isNewRegistration && isPatient) {
          try {
            const patientData = convertAuthUserToPatientRequest(user);
            await patientDataService.registerPatient(patientData, user.accessToken);
            console.log("Patient record created successfully in backend");
          } catch (regError) {
            // Log the error but don't fail the authentication
            // The user is already authenticated in Keycloak
            console.error("Failed to create patient record in backend:", regError);

            // Show a non-blocking warning to the user
            toast({
              title: "Profile Setup Incomplete",
              description: "Your account was created but profile data needs to be completed. Please update your profile.",
              variant: "default",
            });
          }
        }

        setStatus("success");
        toast({
          title: isNewRegistration ? "Welcome to Doctaura!" : "Welcome back!",
          description: `Successfully ${isNewRegistration ? "registered" : "logged in"} as ${user.name}`,
        });

        // Redirect to appropriate dashboard
        const dashboardUrl = keycloakService.getDashboardUrl(user.role);
        setTimeout(() => navigate(dashboardUrl), 1500);
      } catch (error) {
        setStatus("error");

        // Handle specific auth errors
        if (error instanceof AuthError) {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication Error",
            description: "Failed to complete authentication. Please try again.",
            variant: "destructive",
          });
        }

        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          {status === "processing" ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Heart className="h-10 w-10 text-primary" fill="currentColor" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {status === "processing" && "Authenticating..."}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Failed"}
          </h1>
          <p className="text-muted-foreground">
            {status === "processing" && "Please wait while we complete your authentication"}
            {status === "success" && "Redirecting to your dashboard..."}
            {status === "error" && "Redirecting back to login..."}
          </p>
        </div>

        {status === "processing" && (
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

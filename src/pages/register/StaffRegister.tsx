import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Heart,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  UserPlus,
  Users,
  Key,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VALIDATION_PATTERNS } from "@/lib/validators";
import { getAuthErrorMessage } from "@/types/auth.types";
import { staffRegistrationService } from "@/services/staffRegistrationService";
import {
  StaffFormData,
  InvitationCodeValidation,
  STAFF_ROLES,
  StaffRole,
} from "@/types/registration.types";
import { useOnboardingConfig } from "@/hooks/useOnboardingConfig";

// Default fallback for genders (used when config is loading)
const DEFAULT_GENDER_OPTIONS = [
  { id: 0, code: "male", name: "Male" },
  { id: 1, code: "female", name: "Female" },
  { id: 2, code: "other", name: "Other" },
] as const;

// ============================================================================
// Form Validation Schemas
// ============================================================================

const step1Schema = z.object({
  invitationCode: z
    .string()
    .min(6, "Invitation code must be at least 6 characters")
    .max(20, "Invitation code cannot exceed 20 characters"),
});

const step2Schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step3Schema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(VALIDATION_PATTERNS.lettersOnly, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(VALIDATION_PATTERNS.lettersOnly, "Last name can only contain letters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{7,14}$/, "Please enter a valid phone number"),
  gender: z.number().refine((val) => [0, 1, 2].includes(val), "Please select a gender"),
});

const step4Schema = z.object({
  staffRole: z.enum(["receptionist", "nurse", "lab_technician", "admin_assistant", "other"] as const),
  customRole: z.string().optional(),
}).refine(
  (data) => data.staffRole !== "other" || (data.customRole && data.customRole.length >= 2),
  {
    message: "Please specify your role",
    path: ["customRole"],
  }
);

type FormDataType = z.infer<typeof step1Schema> &
  z.infer<typeof step2Schema> &
  z.infer<typeof step3Schema> &
  z.infer<typeof step4Schema>;

// ============================================================================
// Step Configuration
// ============================================================================

const STEPS = [
  { id: 1, title: "Invitation", description: "Enter your code", icon: Key },
  { id: 2, title: "Account", description: "Create credentials", icon: UserPlus },
  { id: 3, title: "Personal", description: "Your information", icon: User },
  { id: 4, title: "Role", description: "Your position", icon: Users },
];

// ============================================================================
// Component
// ============================================================================

const StaffRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Onboarding config (genders from cached config)
  const { data: onboardingConfig } = useOnboardingConfig();

  // Derived config values with fallbacks
  const genderOptions = useMemo(
    () => onboardingConfig?.reference.gender ?? DEFAULT_GENDER_OPTIONS,
    [onboardingConfig]
  );

  // Invitation code validation state
  const [validatedEntity, setValidatedEntity] = useState<InvitationCodeValidation | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormDataType>({
    mode: "onChange",
    defaultValues: {
      invitationCode: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      gender: undefined,
      staffRole: undefined,
      customRole: "",
    },
  });

  const watchStaffRole = watch("staffRole");
  const watchPassword = watch("password");
  const watchInvitationCode = watch("invitationCode");

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!watchPassword) return 0;
    let strength = 0;
    if (watchPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(watchPassword)) strength += 25;
    if (/[a-z]/.test(watchPassword)) strength += 25;
    if (/[0-9]/.test(watchPassword)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  // Validate invitation code
  const handleValidateCode = async () => {
    if (!watchInvitationCode || watchInvitationCode.length < 6) return;

    setIsValidatingCode(true);
    setError(null);

    try {
      const result = await staffRegistrationService.validateInvitationCode(watchInvitationCode);
      setValidatedEntity(result);

      if (!result.valid) {
        setError(result.errorMessage || "Invalid invitation code");
      }
    } catch (err) {
      // Use centralized error message handler for user-friendly messages
      setError(getAuthErrorMessage(err));
      setValidatedEntity({ valid: false, errorMessage: "Validation failed" });
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Step validation
  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        const codeValid = await trigger("invitationCode");
        if (codeValid && (!validatedEntity || !validatedEntity.valid)) {
          await handleValidateCode();
          return validatedEntity?.valid || false;
        }
        return codeValid && (validatedEntity?.valid || false);
      case 2:
        return trigger(["email", "password", "confirmPassword"]);
      case 3:
        return trigger(["firstName", "lastName", "phone", "gender"]);
      case 4:
        return trigger(["staffRole", "customRole"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    setError(null);

    // Special handling for step 1 - validate code first
    if (currentStep === 1 && !validatedEntity?.valid) {
      await handleValidateCode();
      if (!validatedEntity?.valid) {
        return;
      }
    }

    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const onSubmit = async (data: FormDataType) => {
    setIsLoading(true);
    setError(null);

    try {
      const registrationData = {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        gender: data.gender,
        invitationCode: data.invitationCode,
        staffRole: data.staffRole as StaffRole,
        customRole: data.staffRole === "other" ? data.customRole : undefined,
      };

      await staffRegistrationService.registerStaff(registrationData);

      // Navigate to verification page
      navigate("/verify-email", {
        state: { email: data.email, isNewRegistration: true },
      });
    } catch (err) {
      // Use centralized error message handler for user-friendly messages
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  // Step 1: Invitation Code
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Key className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Enter the invitation code provided by your employer (doctor or clinic)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invitationCode">Invitation Code <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="invitationCode"
            placeholder="Enter your invitation code"
            className={cn(
              "pl-10 text-center text-lg tracking-wider",
              errors.invitationCode && "border-destructive",
              validatedEntity?.valid && "border-accent"
            )}
            {...register("invitationCode")}
          />
        </div>
        {errors.invitationCode && (
          <p className="text-xs text-destructive">{errors.invitationCode.message}</p>
        )}
      </div>

      {/* Validated Entity Display */}
      {validatedEntity?.valid && (
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">Code Verified</p>
              <p className="text-sm text-muted-foreground">
                You will be joining:{" "}
                <span className="font-medium text-foreground">
                  {validatedEntity.entityName}
                </span>
                {validatedEntity.entityType && (
                  <span className="text-xs ml-1">
                    ({validatedEntity.entityType === "doctor" ? "Doctor's Office" : "Clinic"})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {validatedEntity && !validatedEntity.valid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validatedEntity.errorMessage || "Invalid or expired invitation code"}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleValidateCode}
        disabled={isValidatingCode || !watchInvitationCode || watchInvitationCode.length < 6}
      >
        {isValidatingCode ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          <>
            Validate Code
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Don't have a code? Contact your employer to request an invitation.
      </p>
    </div>
  );

  // Step 2: Account Information
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={cn("pl-10", errors.email && "border-destructive")}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            className={cn("pl-10 pr-10", errors.password && "border-destructive")}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {watchPassword && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  passwordStrength < 50 ? "bg-destructive" :
                  passwordStrength < 75 ? "bg-yellow-500" :
                  passwordStrength < 100 ? "bg-accent" : "bg-primary"
                )}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {passwordStrength < 50 ? "Weak" :
               passwordStrength < 75 ? "Fair" :
               passwordStrength < 100 ? "Good" : "Strong"}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className={cn("pl-10 pr-10", errors.confirmPassword && "border-destructive")}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
    </div>
  );

  // Step 3: Personal Information
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              placeholder="John"
              className={cn("pl-10", errors.firstName && "border-destructive")}
              {...register("firstName")}
            />
          </div>
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastName"
              placeholder="Doe"
              className={cn("pl-10", errors.lastName && "border-destructive")}
              {...register("lastName")}
            />
          </div>
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            className={cn("pl-10", errors.phone && "border-destructive")}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Gender <span className="text-destructive">*</span></Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value !== undefined ? field.value.toString() : ""}
              onValueChange={(val) => field.onChange(parseInt(val))}
            >
              <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.code} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && (
          <p className="text-xs text-destructive">{errors.gender.message}</p>
        )}
      </div>
    </div>
  );

  // Step 4: Role Selection
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Your Role <span className="text-destructive">*</span></Label>
        <Controller
          name="staffRole"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-3"
            >
              {STAFF_ROLES.map((role) => (
                <Label
                  key={role.value}
                  className={cn(
                    "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                    field.value === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={role.value} />
                  <span className="font-medium">{role.label}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.staffRole && (
          <p className="text-xs text-destructive">{errors.staffRole.message}</p>
        )}
      </div>

      {watchStaffRole === "other" && (
        <div className="space-y-2">
          <Label htmlFor="customRole">Specify Your Role</Label>
          <Input
            id="customRole"
            placeholder="Enter your role"
            className={errors.customRole ? "border-destructive" : ""}
            {...register("customRole")}
          />
          {errors.customRole && (
            <p className="text-xs text-destructive">{errors.customRole.message}</p>
          )}
        </div>
      )}

      {/* Entity Reminder */}
      {validatedEntity?.valid && (
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            You will be registered as staff for:{" "}
            <span className="font-medium">{validatedEntity.entityName}</span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent mb-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Staff Registration</h1>
              <p className="text-muted-foreground mt-1">
                Join a healthcare team
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between">
                {STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex flex-col items-center",
                      index < STEPS.length - 1 && "flex-1"
                    )}
                  >
                    <div className="flex items-center w-full">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                          currentStep > step.id
                            ? "bg-primary text-primary-foreground"
                            : currentStep === step.id
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={cn(
                            "h-1 flex-1 mx-2 rounded",
                            currentStep > step.id ? "bg-primary" : "bg-muted"
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-2 hidden sm:block",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <Card className="shadow-lg border-border/50">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              <CardContent className="p-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step Title */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">{STEPS[currentStep - 1].title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {STEPS[currentStep - 1].description}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    {currentStep < STEPS.length ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || isValidatingCode || (currentStep === 1 && !validatedEntity?.valid)}
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="gradient-hero text-white"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                    Sign in
                  </Link>
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

export default StaffRegister;

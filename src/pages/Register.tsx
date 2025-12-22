import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle2,
  UserPlus,
  Stethoscope,
  Droplets,
  AlertTriangle,
  Users,
  Sparkles,
  MapPin,
  Globe,
  Building2,
  Home,
} from "lucide-react";
import { authService, PatientRegistrationRequest } from "@/services/authService";
import {
  locationService,
  Country,
  Location,
} from "@/services/locationService";
import { Gender } from "@/types/generated/gender";
import { getAuthErrorMessage } from "@/types/auth.types";
import { cn } from "@/lib/utils";

// Gender options mapping
const GENDER_OPTIONS = [
  { value: Gender.NUMBER_0, label: "Male" },
  { value: Gender.NUMBER_1, label: "Female" },
  { value: Gender.NUMBER_2, label: "Other" },
] as const;

// Form validation schemas for each step
const step1Schema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
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

const step2Schema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{7,14}$/, "Please enter a valid phone number"),
  gender: z.number({
    required_error: "Please select your gender",
  }).refine((val) => [0, 1, 2].includes(val), {
    message: "Please select a valid gender",
  }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, "You must be at least 13 years old"),
  countryId: z.number().min(1, "Please select your country"),
  governorateId: z.number().optional(),
  districtId: z.number().optional(),
  localityId: z.number().optional(),
});

const step3Schema = z.object({
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  allergies: z.string().max(500, "Allergies must be less than 500 characters").optional(),
  chronicConditions: z.string().max(1000, "Chronic conditions must be less than 1000 characters").optional(),
  emergencyContactName: z.string().max(100, "Name must be less than 100 characters").optional(),
  emergencyContactPhone: z
    .string()
    .regex(/^(\+?[1-9]\d{7,14})?$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

// Combined schema for final submission
const fullSchema = step1Schema.and(step2Schema).and(step3Schema);

type FormData = z.infer<typeof fullSchema>;

const STEPS = [
  { id: 1, title: "Account", description: "Create your credentials", icon: UserPlus },
  { id: 2, title: "Personal", description: "Tell us about yourself", icon: User },
  { id: 3, title: "Medical", description: "Health information", icon: Stethoscope },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Location data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [governorates, setGovernorates] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [localities, setLocalities] = useState<Location[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingGovernorates, setLoadingGovernorates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      gender: undefined,
      dateOfBirth: "",
      countryId: undefined,
      governorateId: undefined,
      districtId: undefined,
      localityId: undefined,
      bloodType: undefined,
      allergies: "",
      chronicConditions: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  const watchPassword = watch("password");
  const watchEmail = watch("email");
  const watchCountryId = watch("countryId");
  const watchGovernorateId = watch("governorateId");
  const watchDistrictId = watch("districtId");

  // Load countries and governorates once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingCountries(true);
        setLoadingGovernorates(true);

        const [countriesData, governoratesData] = await Promise.all([
          locationService.getCountries(),
          locationService.getGovernorates(),
        ]);

        setCountries(countriesData);
        setGovernorates(governoratesData);
      } catch (err) {
        console.error("Failed to load location data:", err);
      } finally {
        setLoadingCountries(false);
        setLoadingGovernorates(false);
      }
    };
    loadInitialData();
  }, []);

  // Cache for districts and localities to avoid re-fetching
  const districtsCache = useRef<Record<number, Location[]>>({});
  const localitiesCache = useRef<Record<number, Location[]>>({});

  // Load districts when governorate changes
  const handleGovernorateChange = async (governorateId: number | undefined) => {
    setValue("governorateId", governorateId);
    setValue("districtId", undefined);
    setValue("localityId", undefined);
    setLocalities([]);

    if (!governorateId) {
      setDistricts([]);
      return;
    }

    // Check cache first
    if (districtsCache.current[governorateId]) {
      setDistricts(districtsCache.current[governorateId]);
      return;
    }

    try {
      setLoadingDistricts(true);
      const data = await locationService.getDistrictsByGovernorate(governorateId);
      districtsCache.current[governorateId] = data;
      setDistricts(data);
    } catch (err) {
      console.error("Failed to load districts:", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load localities when district changes
  const handleDistrictChange = async (districtId: number | undefined) => {
    setValue("districtId", districtId);
    setValue("localityId", undefined);

    if (!districtId) {
      setLocalities([]);
      return;
    }

    // Check cache first
    if (localitiesCache.current[districtId]) {
      setLocalities(localitiesCache.current[districtId]);
      return;
    }

    try {
      setLoadingLocalities(true);
      const data = await locationService.getLocalitiesByDistrict(districtId);
      localitiesCache.current[districtId] = data;
      setLocalities(data);
    } catch (err) {
      console.error("Failed to load localities:", err);
    } finally {
      setLoadingLocalities(false);
    }
  };

  // Calculate password strength
  useEffect(() => {
    if (!watchPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (watchPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(watchPassword)) strength += 25;
    if (/[a-z]/.test(watchPassword)) strength += 25;
    if (/[0-9]/.test(watchPassword)) strength += 15;
    if (/[^A-Za-z0-9]/.test(watchPassword)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  }, [watchPassword]);

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

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "email", "password", "confirmPassword"];
        break;
      case 2:
        fieldsToValidate = ["phone", "gender", "dateOfBirth", "countryId"];
        break;
      case 3:
        fieldsToValidate = ["bloodType", "allergies", "chronicConditions", "emergencyContactName", "emergencyContactPhone"];
        break;
    }

    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Prevent form submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const registrationData: PatientRegistrationRequest = {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        gender: data.gender as Gender,
        dateOfBirth: data.dateOfBirth,
        countryId: data.countryId,
        governorateId: data.governorateId,
        districtId: data.districtId,
        localityId: data.localityId,
        bloodType: data.bloodType,
        allergies: data.allergies || undefined,
        chronicConditions: data.chronicConditions || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
      };

      await authService.registerPatient(registrationData);

      // Navigate to success/verification page
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start min-h-[calc(100vh-12rem)]">
              {/* Left Side - Stepper & Info */}
              <div className="lg:col-span-2 lg:sticky lg:top-24">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                    <Heart className="h-6 w-6 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Doctaura
                    </h1>
                    <p className="text-sm text-muted-foreground">Join Our Community</p>
                  </div>
                </div>

                {/* Progress Steps - Desktop */}
                <div className="hidden lg:block space-y-1">
                  {STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                      <div key={step.id} className="relative">
                        <div
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl transition-all",
                            isCurrent && "bg-primary/5 border border-primary/20",
                            isCompleted && "opacity-60"
                          )}
                        >
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                              isCurrent && "bg-primary text-white shadow-lg shadow-primary/30",
                              isCompleted && "bg-accent text-white",
                              !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <StepIcon className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <p className={cn(
                              "font-semibold",
                              isCurrent && "text-primary",
                              !isCurrent && "text-foreground"
                            )}>
                              {step.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Connector Line */}
                        {index < STEPS.length - 1 && (
                          <div className="absolute left-9 top-16 w-0.5 h-4 bg-border" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Trust Badges */}
                <div className="hidden lg:block mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Your data is encrypted and secure</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Join 10,000+ patients on our platform</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="lg:col-span-3">
                <Card className="shadow-2xl shadow-primary/5 border-border/50 overflow-hidden">
                  {/* Progress Bar */}
                  <div className="h-2 bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                      style={{ width: `${((currentStep) / STEPS.length) * 100}%` }}
                    />
                  </div>

                  <CardContent className="p-6 sm:p-8">
                    {/* Mobile Progress */}
                    <div className="lg:hidden mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Step {currentStep} of {STEPS.length}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {STEPS[currentStep - 1].title}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {STEPS.map((step) => (
                          <div
                            key={step.id}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-all",
                              step.id <= currentStep ? "bg-primary" : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Step Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-foreground">
                        {currentStep === 1 && "Create Your Account"}
                        {currentStep === 2 && "Personal Information"}
                        {currentStep === 3 && "Medical Information"}
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        {currentStep === 1 && "Start your healthcare journey with Doctaura"}
                        {currentStep === 2 && "Help us personalize your experience"}
                        {currentStep === 3 && "Optional but recommended for better care"}
                      </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <Alert variant="destructive" className="mb-6 animate-in fade-in-0 slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Form */}
                    <form onKeyDown={handleKeyDown} className="space-y-5">
                      {/* Step 1: Account Information */}
                      {currentStep === 1 && (
                        <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4">
                          {/* Name Fields */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="firstName"
                                  placeholder="John"
                                  className={cn(
                                    "pl-10 h-12 bg-muted/30",
                                    errors.firstName && "border-destructive"
                                  )}
                                  {...register("firstName")}
                                />
                              </div>
                              {errors.firstName && (
                                <p className="text-sm text-destructive">{errors.firstName.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="lastName"
                                  placeholder="Doe"
                                  className={cn(
                                    "pl-10 h-12 bg-muted/30",
                                    errors.lastName && "border-destructive"
                                  )}
                                  {...register("lastName")}
                                />
                              </div>
                              {errors.lastName && (
                                <p className="text-sm text-destructive">{errors.lastName.message}</p>
                              )}
                            </div>
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                className={cn(
                                  "pl-10 h-12 bg-muted/30",
                                  errors.email && "border-destructive"
                                )}
                                {...register("email")}
                              />
                              {watchEmail && !errors.email && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                              )}
                            </div>
                            {errors.email && (
                              <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                          </div>

                          {/* Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                className={cn(
                                  "pl-10 pr-10 h-12 bg-muted/30",
                                  errors.password && "border-destructive"
                                )}
                                {...register("password")}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {watchPassword && (
                              <div className="space-y-2">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4].map((i) => (
                                    <div
                                      key={i}
                                      className={cn(
                                        "h-1.5 flex-1 rounded-full transition-all",
                                        passwordStrength >= i * 25
                                          ? getPasswordStrengthColor()
                                          : "bg-muted"
                                      )}
                                    />
                                  ))}
                                </div>
                                <p className={cn(
                                  "text-xs",
                                  passwordStrength < 60 ? "text-yellow-500" : "text-accent"
                                )}>
                                  Password strength: {getPasswordStrengthText()}
                                </p>
                              </div>
                            )}
                            {errors.password && (
                              <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                          </div>

                          {/* Confirm Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className={cn(
                                  "pl-10 pr-10 h-12 bg-muted/30",
                                  errors.confirmPassword && "border-destructive"
                                )}
                                {...register("confirmPassword")}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Personal Information */}
                      {currentStep === 2 && (
                        <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4">
                          {/* Phone Field */}
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative group">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1234567890"
                                className={cn(
                                  "pl-10 h-12 bg-muted/30",
                                  errors.phone && "border-destructive"
                                )}
                                {...register("phone")}
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-sm text-destructive">{errors.phone.message}</p>
                            )}
                          </div>

                          {/* Gender & Date of Birth */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Gender Field */}
                            <div className="space-y-2">
                              <Label>Gender</Label>
                              <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value?.toString()}
                                  >
                                    <SelectTrigger className={cn(
                                      "h-12 bg-muted/30",
                                      errors.gender && "border-destructive"
                                    )}>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {GENDER_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value.toString()}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.gender && (
                                <p className="text-sm text-destructive">{errors.gender.message}</p>
                              )}
                            </div>

                            {/* Date of Birth Field */}
                            <div className="space-y-2">
                              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                              <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="dateOfBirth"
                                  type="date"
                                  className={cn(
                                    "pl-10 h-12 bg-muted/30",
                                    errors.dateOfBirth && "border-destructive"
                                  )}
                                  max={new Date().toISOString().split("T")[0]}
                                  {...register("dateOfBirth")}
                                />
                              </div>
                              {errors.dateOfBirth && (
                                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                              )}
                            </div>
                          </div>

                          {/* Location Section */}
                          <div className="pt-4 border-t border-border/50">
                            <Label className="flex items-center gap-2 mb-4 text-base font-semibold">
                              <MapPin className="h-5 w-5 text-primary" />
                              Location
                            </Label>

                            {/* Country Field */}
                            <div className="space-y-2 mb-4">
                              <Label className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                Country <span className="text-destructive">*</span>
                              </Label>
                              <Controller
                                name="countryId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value?.toString()}
                                    disabled={loadingCountries}
                                  >
                                    <SelectTrigger className={cn(
                                      "h-12 bg-muted/30",
                                      errors.countryId && "border-destructive"
                                    )}>
                                      <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select country"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.id.toString()}>
                                          {country.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.countryId && (
                                <p className="text-sm text-destructive">{errors.countryId.message}</p>
                              )}
                            </div>

                            {/* Governorate Field */}
                            <div className="space-y-2 mb-4">
                              <Label className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                Governorate <span className="text-xs">(Optional)</span>
                              </Label>
                              <Controller
                                name="governorateId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={(value) => handleGovernorateChange(value ? parseInt(value) : undefined)}
                                    value={field.value?.toString() || ""}
                                    disabled={!watchCountryId || loadingGovernorates}
                                  >
                                    <SelectTrigger className="h-12 bg-muted/30">
                                      <SelectValue placeholder={
                                        !watchCountryId
                                          ? "Select country first"
                                          : loadingGovernorates
                                            ? "Loading..."
                                            : "Select governorate"
                                      } />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {governorates.map((gov) => (
                                        <SelectItem key={gov.id} value={gov.id.toString()}>
                                          {gov.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            {/* District & Locality */}
                            <div className="grid grid-cols-2 gap-4">
                              {/* District Field */}
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                  <Home className="h-4 w-4" />
                                  District
                                </Label>
                                <Controller
                                  name="districtId"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      onValueChange={(value) => handleDistrictChange(value ? parseInt(value) : undefined)}
                                      value={field.value?.toString() || ""}
                                      disabled={!watchGovernorateId || loadingDistricts}
                                    >
                                      <SelectTrigger className="h-12 bg-muted/30">
                                        <SelectValue placeholder={
                                          !watchGovernorateId
                                            ? "Select governorate"
                                            : loadingDistricts
                                              ? "Loading..."
                                              : "Select district"
                                        } />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {districts.map((dist) => (
                                          <SelectItem key={dist.id} value={dist.id.toString()}>
                                            {dist.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>

                              {/* Locality Field */}
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  Locality
                                </Label>
                                <Controller
                                  name="localityId"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                      value={field.value?.toString() || ""}
                                      disabled={!watchDistrictId || loadingLocalities}
                                    >
                                      <SelectTrigger className="h-12 bg-muted/30">
                                        <SelectValue placeholder={
                                          !watchDistrictId
                                            ? "Select district"
                                            : loadingLocalities
                                              ? "Loading..."
                                              : "Select locality"
                                        } />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {localities.map((loc) => (
                                          <SelectItem key={loc.id} value={loc.id.toString()}>
                                            {loc.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Medical Information */}
                      {currentStep === 3 && (
                        <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4">
                          {/* Optional Notice */}
                          <Alert className="bg-muted/50 border-muted-foreground/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-muted-foreground">
                              This information helps us provide better care. You can skip or update it later.
                            </AlertDescription>
                          </Alert>

                          {/* Blood Type Field */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-destructive" />
                              Blood Type
                            </Label>
                            <Controller
                              name="bloodType"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="h-12 bg-muted/30">
                                    <SelectValue placeholder="Select your blood type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BLOOD_TYPES.map((type) => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          {/* Allergies Field */}
                          <div className="space-y-2">
                            <Label htmlFor="allergies" className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Known Allergies
                            </Label>
                            <Textarea
                              id="allergies"
                              placeholder="List any known allergies (e.g., Penicillin, Peanuts)"
                              className="min-h-[80px] bg-muted/30 resize-none"
                              {...register("allergies")}
                            />
                          </div>

                          {/* Chronic Conditions Field */}
                          <div className="space-y-2">
                            <Label htmlFor="chronicConditions" className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              Chronic Conditions
                            </Label>
                            <Textarea
                              id="chronicConditions"
                              placeholder="List any chronic conditions (e.g., Diabetes, Hypertension)"
                              className="min-h-[80px] bg-muted/30 resize-none"
                              {...register("chronicConditions")}
                            />
                          </div>

                          {/* Emergency Contact */}
                          <div className="pt-4 border-t border-border/50">
                            <Label className="flex items-center gap-2 mb-4">
                              <Users className="h-4 w-4 text-accent" />
                              Emergency Contact
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="emergencyContactName" className="text-sm text-muted-foreground">Name</Label>
                                <Input
                                  id="emergencyContactName"
                                  placeholder="Contact name"
                                  className="h-12 bg-muted/30"
                                  {...register("emergencyContactName")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="emergencyContactPhone" className="text-sm text-muted-foreground">Phone</Label>
                                <Input
                                  id="emergencyContactPhone"
                                  type="tel"
                                  placeholder="+1234567890"
                                  className={cn(
                                    "h-12 bg-muted/30",
                                    errors.emergencyContactPhone && "border-destructive"
                                  )}
                                  {...register("emergencyContactPhone")}
                                />
                              </div>
                            </div>
                            {errors.emergencyContactPhone && (
                              <p className="text-sm text-destructive mt-1">{errors.emergencyContactPhone.message}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex gap-4 pt-4">
                        {currentStep > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1 h-12 text-base"
                          >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                          </Button>
                        )}

                        {currentStep < 3 ? (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="flex-1 h-12 text-base gradient-hero text-white shadow-lg shadow-primary/25"
                          >
                            Continue
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={isLoading}
                            onClick={handleSubmit(onSubmit)}
                            className="flex-1 h-12 text-base gradient-hero text-white shadow-lg shadow-primary/25"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Account...
                              </>
                            ) : (
                              <>
                                Create Account
                                <CheckCircle2 className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                          Sign in
                        </Link>
                      </p>
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

export default Register;

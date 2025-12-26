import { useState, useEffect, useRef, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUpload } from "@/components/ui/file-upload";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Heart,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  UserPlus,
  Stethoscope,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Globe,
  DollarSign,
  Video,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VALIDATION_PATTERNS } from "@/lib/validators";
import { getAuthErrorMessage } from "@/types/auth.types";
import { doctorRegistrationService } from "@/services/doctorRegistrationService";
import { locationService } from "@/services/locationService";
import type { Location } from "@/services/locationService";
import {
  DoctorFormData,
  Specialty,
  Language,
  ClinicSearchResult,
  CONSULTATION_TYPES,
  PRACTICE_TYPES,
  DEFAULT_SPECIALTIES,
  DEFAULT_LANGUAGES,
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

const step2Schema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{7,14}$/, "Please enter a valid phone number"),
  gender: z.number().refine((val) => [0, 1, 2].includes(val), "Please select a gender"),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 21 && age <= 100; // Doctors must be at least 21
    },
    "You must be at least 21 years old to register as a doctor"
  ),
});

const step3Schema = z.object({
  specialtyId: z.number().min(1, "Please select a specialty"),
  medicalLicenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters")
    .max(50, "License number cannot exceed 50 characters")
    .regex(VALIDATION_PATTERNS.alphanumeric, "License number can only contain letters and numbers"),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(60, "Please enter a valid number"),
  languageIds: z.array(z.number()).min(1, "Please select at least one language"),
  consultationType: z.enum(["in_person", "video", "both"]),
  consultationFee: z.number().positive().optional().or(z.literal(0)),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

const step4Schema = z.object({
  practiceType: z.enum(["private_clinic", "hospital_employee", "existing_clinic"]),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
  hospitalName: z.string().optional(),
  clinicInvitationCode: z.string().optional(),
});

const step5Schema = z.object({
  serviceAreaCountryIds: z.array(z.number()).min(1, "Please select at least one country"),
  serviceAreaGovernorateIds: z.array(z.number()).optional(),
  serviceAreaDistrictIds: z.array(z.number()).optional(),
  serviceAreaLocalityIds: z.array(z.number()).optional(),
});

const fullSchema = step1Schema
  .and(step2Schema)
  .and(step3Schema)
  .and(step4Schema)
  .and(step5Schema);

type FormData = z.infer<typeof fullSchema>;

// ============================================================================
// Step Configuration
// ============================================================================

const STEPS = [
  { id: 1, title: "Account", description: "Create your credentials", icon: UserPlus },
  { id: 2, title: "Personal", description: "Your basic information", icon: User },
  { id: 3, title: "Professional", description: "Medical credentials", icon: Stethoscope },
  { id: 4, title: "Practice", description: "Clinic or hospital", icon: Building2 },
  { id: 5, title: "Service Areas", description: "Where you practice", icon: MapPin },
];

// ============================================================================
// Component
// ============================================================================

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Onboarding config (countries, genders from cached config)
  const { data: onboardingConfig, loading: configLoading } = useOnboardingConfig();

  // Derived config values with fallbacks
  const countries = useMemo(
    () => onboardingConfig?.reference.countries ?? [],
    [onboardingConfig]
  );
  const genderOptions = useMemo(
    () => onboardingConfig?.reference.gender ?? DEFAULT_GENDER_OPTIONS,
    [onboardingConfig]
  );
  const specialties = useMemo(
    () => onboardingConfig?.reference.specialties ?? DEFAULT_SPECIALTIES,
    [onboardingConfig]
  );
  const languages = useMemo(
    () => onboardingConfig?.reference.supportedLanguages ?? DEFAULT_LANGUAGES,
    [onboardingConfig]
  );
  const governorates = useMemo(
    () => onboardingConfig?.reference.governorates ?? [],
    [onboardingConfig]
  );

  // Districts and localities still loaded dynamically based on selection
  const [districts, setDistricts] = useState<Location[]>([]);
  const [localities, setLocalities] = useState<Location[]>([]);

  // File upload
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Clinic search
  const [clinicSearchResults, setClinicSearchResults] = useState<ClinicSearchResult[]>([]);
  const [invitationCodeValid, setInvitationCodeValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
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
      specialtyId: undefined,
      medicalLicenseNumber: "",
      yearsOfExperience: 0,
      languageIds: [],
      consultationType: "both",
      consultationFee: undefined,
      bio: "",
      practiceType: "private_clinic",
      clinicName: "",
      clinicAddress: "",
      clinicPhone: "",
      hospitalName: "",
      clinicInvitationCode: "",
      serviceAreaCountryIds: [],
      serviceAreaGovernorateIds: [],
      serviceAreaDistrictIds: [],
      serviceAreaLocalityIds: [],
    },
  });

  const watchPracticeType = watch("practiceType");
  const watchPassword = watch("password");
  const watchServiceAreaCountryIds = watch("serviceAreaCountryIds");

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

  // All reference data (countries, genders, specialties, languages, governorates)
  // comes from cached onboardingConfig - no additional API calls needed

  // Step validation
  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate: (keyof FormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate.push("firstName", "lastName", "email", "password", "confirmPassword");
        break;
      case 2:
        fieldsToValidate.push("phone", "gender", "dateOfBirth");
        break;
      case 3:
        fieldsToValidate.push("specialtyId", "medicalLicenseNumber", "yearsOfExperience", "languageIds", "consultationType");
        break;
      case 4:
        fieldsToValidate.push("practiceType");
        if (watchPracticeType === "private_clinic") {
          fieldsToValidate.push("clinicName", "clinicAddress");
        } else if (watchPracticeType === "hospital_employee") {
          fieldsToValidate.push("hospitalName");
        }
        break;
      case 5:
        fieldsToValidate.push("serviceAreaCountryIds");
        break;
    }

    return trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    setError(null);
    const isValid = await validateCurrentStep();

    // Debug: log validation result and current errors
    console.log("Validation result:", isValid);
    console.log("Form errors after validation:", control._formState.errors);

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      setError("Please fill in all required fields before continuing.");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload certification file if provided
      let certificationFileUrl: string | undefined;
      if (certificationFile) {
        setIsUploadingFile(true);
        const uploadResult = await doctorRegistrationService.uploadCertification(certificationFile);
        certificationFileUrl = uploadResult.url;
        setIsUploadingFile(false);
      }

      // Prepare registration data
      const registrationData = {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        specialtyId: data.specialtyId,
        medicalLicenseNumber: data.medicalLicenseNumber,
        yearsOfExperience: data.yearsOfExperience,
        certificationFileUrl,
        languageIds: data.languageIds,
        consultationType: data.consultationType,
        consultationFee: data.consultationFee,
        bio: data.bio,
        practiceType: data.practiceType,
        clinicName: data.practiceType === "private_clinic" ? data.clinicName : undefined,
        clinicAddress: data.practiceType === "private_clinic" ? data.clinicAddress : undefined,
        clinicPhone: data.practiceType === "private_clinic" ? data.clinicPhone : undefined,
        hospitalName: data.practiceType === "hospital_employee" ? data.hospitalName : undefined,
        clinicInvitationCode: data.practiceType === "existing_clinic" ? data.clinicInvitationCode : undefined,
        serviceAreaCountryIds: data.serviceAreaCountryIds,
        serviceAreaGovernorateIds: data.serviceAreaGovernorateIds,
        serviceAreaDistrictIds: data.serviceAreaDistrictIds,
        serviceAreaLocalityIds: data.serviceAreaLocalityIds,
      };

      await doctorRegistrationService.registerDoctor(registrationData);

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
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // Step 1: Account Information
  const renderStep1 = () => (
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
        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="doctor@example.com"
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

  // Step 2: Personal Information
  const renderStep2 = () => (
    <div className="space-y-4">
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
                {genderOptions.map((option, index) => {
                  const id = option.id ?? index;
                  return (
                    <SelectItem key={option.code ?? id} value={id.toString()}>
                      {option.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && (
          <p className="text-xs text-destructive">{errors.gender.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="dateOfBirth"
            type="date"
            className={cn("pl-10", errors.dateOfBirth && "border-destructive")}
            {...register("dateOfBirth")}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>
    </div>
  );

  // Step 3: Professional Information
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Specialty <span className="text-destructive">*</span></Label>
        <Controller
          name="specialtyId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value !== undefined ? field.value.toString() : ""}
              onValueChange={(val) => field.onChange(parseInt(val))}
              disabled={configLoading && specialties.length === 0}
            >
              <SelectTrigger className={errors.specialtyId ? "border-destructive" : ""}>
                <SelectValue placeholder={configLoading && specialties.length === 0 ? "Loading..." : "Select your specialty"} />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty, index) => {
                  const id = specialty.id ?? index + 1;
                  return (
                    <SelectItem key={id} value={id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.specialtyId && (
          <p className="text-xs text-destructive">{errors.specialtyId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medicalLicenseNumber">Medical License Number <span className="text-destructive">*</span></Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="medicalLicenseNumber"
              placeholder="License number"
              className={cn("pl-10", errors.medicalLicenseNumber && "border-destructive")}
              {...register("medicalLicenseNumber")}
            />
          </div>
          {errors.medicalLicenseNumber && (
            <p className="text-xs text-destructive">{errors.medicalLicenseNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience <span className="text-destructive">*</span></Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="60"
            className={errors.yearsOfExperience ? "border-destructive" : ""}
            {...register("yearsOfExperience", { valueAsNumber: true })}
          />
          {errors.yearsOfExperience && (
            <p className="text-xs text-destructive">{errors.yearsOfExperience.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Medical Certification (Optional)</Label>
        <FileUpload
          accept=".pdf,.jpg,.jpeg,.png"
          maxSize={10 * 1024 * 1024} // 10MB
          onFilesSelected={(files) => setCertificationFile(files[0] || null)}
          helperText="Upload your medical license or certification document"
          isUploading={isUploadingFile}
        />
      </div>

      <div className="space-y-2">
        <Label>Languages Spoken <span className="text-destructive">*</span></Label>
        <Controller
          name="languageIds"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={languages.map((lang, index) => ({
                value: lang.id ?? index + 1, // Fallback to index+1 if id is undefined
                label: lang.name,
              }))}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select languages you speak"
              isLoading={configLoading && languages.length === 0}
              error={errors.languageIds?.message}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Consultation Type <span className="text-destructive">*</span></Label>
        <Controller
          name="consultationType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-3 gap-3"
            >
              {CONSULTATION_TYPES.map((type) => (
                <Label
                  key={type.value}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all",
                    field.value === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={type.value} className="sr-only" />
                  {type.value === "in_person" && <Users className="h-5 w-5" />}
                  {type.value === "video" && <Video className="h-5 w-5" />}
                  {type.value === "both" && <Globe className="h-5 w-5" />}
                  <span className="text-sm font-medium">{type.label}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="consultationFee">Consultation Fee (Optional)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="consultationFee"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="pl-10"
            {...register("consultationFee", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder="Tell patients about yourself, your experience, and your approach to healthcare..."
          className="min-h-[100px]"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>
    </div>
  );

  // Step 4: Practice/Clinic Information
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Practice Type <span className="text-destructive">*</span></Label>
        <Controller
          name="practiceType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="space-y-3"
            >
              {PRACTICE_TYPES.map((type) => (
                <Label
                  key={type.value}
                  className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all",
                    field.value === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={type.value} className="mt-1" />
                  <div>
                    <span className="font-medium">{type.label}</span>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      {/* Conditional fields based on practice type */}
      {watchPracticeType === "private_clinic" && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium">Clinic Details</h4>
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              placeholder="Your clinic name"
              {...register("clinicName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">Clinic Address</Label>
            <Textarea
              id="clinicAddress"
              placeholder="Full address"
              {...register("clinicAddress")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicPhone">Clinic Phone</Label>
            <Input
              id="clinicPhone"
              type="tel"
              placeholder="+1234567890"
              {...register("clinicPhone")}
            />
          </div>
        </div>
      )}

      {watchPracticeType === "hospital_employee" && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium">Hospital Information</h4>
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input
              id="hospitalName"
              placeholder="Hospital name"
              {...register("hospitalName")}
            />
          </div>
        </div>
      )}

      {watchPracticeType === "existing_clinic" && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium">Link to Existing Clinic</h4>
          <p className="text-sm text-muted-foreground">
            Enter an invitation code from the clinic, or search for clinics to request access.
          </p>
          <div className="space-y-2">
            <Label htmlFor="clinicInvitationCode">Invitation Code</Label>
            <Input
              id="clinicInvitationCode"
              placeholder="Enter invitation code"
              {...register("clinicInvitationCode")}
            />
            {invitationCodeValid === true && (
              <p className="text-sm text-accent flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Valid code
              </p>
            )}
            {invitationCodeValid === false && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Invalid or expired code
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Don't have a code? Contact the clinic administrator to request one.
          </p>
        </div>
      )}
    </div>
  );

  // Step 5: Service Areas
  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Countries <span className="text-destructive">*</span></Label>
        <Controller
          name="serviceAreaCountryIds"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={countries.map((country, index) => ({
                value: country.id ?? index + 1,
                label: country.name,
              }))}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select countries where you practice"
              isLoading={configLoading && countries.length === 0}
              error={errors.serviceAreaCountryIds?.message}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Governorates (Optional)</Label>
        <Controller
          name="serviceAreaGovernorateIds"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={governorates.map((gov, index) => ({
                value: gov.id ?? index + 1,
                label: gov.name,
              }))}
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Select governorates"
              isLoading={configLoading && governorates.length === 0}
              helperText="Narrow down your service area by selecting specific governorates"
            />
          )}
        />
      </div>

      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Selecting service areas helps patients find you when searching for doctors in their region.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Doctor Registration</h1>
              <p className="text-muted-foreground mt-1">
                Join our network of healthcare professionals
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
              <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
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
                      <Button type="button" onClick={handleNext} disabled={isLoading}>
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

export default DoctorRegister;

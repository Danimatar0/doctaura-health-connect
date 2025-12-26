import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { keycloakService } from "@/services/keycloakService";
import { locationService, Location } from "@/services/locationService";
import { useOnboardingConfig } from "@/hooks/useOnboardingConfig";
import { AuthUser, ProfileUpdateData } from "@/types/auth.types";
import type { PatientDetailsDto } from "@/types/generated";
import { Loader2 } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  patientData?: PatientDetailsDto | null;
  onProfileUpdated: (updatedUser: AuthUser) => void;
}

// Gender enum to string mapping
const GenderDisplay: Record<number, string> = {
  0: "male",
  1: "female",
  2: "other",
};

const EditProfileDialog = ({
  open,
  onOpenChange,
  user,
  patientData,
  onProfileUpdated,
}: EditProfileDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Use cached onboarding config for countries and governorates
  const { data: configData } = useOnboardingConfig();

  // Derive reference data from cached config
  const countries = useMemo(() => configData?.reference?.countries || [], [configData]);
  const governorates = useMemo(() => configData?.reference?.governorates || [], [configData]);
  const genderOptions = useMemo(() => configData?.reference?.gender || [], [configData]);
  const bloodTypeOptions = useMemo(() => configData?.reference?.bloodTypes || [], [configData]);

  // Location dropdown states (districts and localities still need API calls)
  const [districts, setDistricts] = useState<Location[]>([]);
  const [localities, setLocalities] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Form data - prioritize patientData over user data
  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstName: patientData?.firstName || user.firstName || "",
    lastName: patientData?.lastName || user.lastName || "",
    phone: patientData?.phone || user.phone || "",
    gender: patientData?.gender !== undefined
      ? GenderDisplay[patientData.gender]
      : user.gender || "",
    dateOfBirth: patientData?.dateOfBirth?.split("T")[0] || user.dateOfBirth || "",
    country: patientData?.countryId?.toString() || user.country || "",
    governorateId: patientData?.governorateId?.toString() || user.governorateId || "",
    districtId: patientData?.districtId?.toString() || user.districtId || "",
    localityId: patientData?.localityId?.toString() || user.localityId || "",
    locale: patientData?.preferredLanguage || user.locale || "",
    bloodType: patientData?.bloodType || user.bloodType || "",
    specialty: user.specialty || "",
    medicalCertification: user.medicalCertification || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileUpdateData, string>>>({});

  // Load districts when governorate changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.governorateId) {
        setDistricts([]);
        return;
      }

      try {
        setLoadingLocations(true);
        const data = await locationService.getDistrictsByGovernorate(parseInt(formData.governorateId));
        setDistricts(data);
      } catch (e) {
        console.error("Failed to load districts:", e);
        setDistricts([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadDistricts();
  }, [formData.governorateId]);

  // Load localities when district changes
  useEffect(() => {
    const loadLocalities = async () => {
      if (!formData.districtId) {
        setLocalities([]);
        return;
      }

      try {
        setLoadingLocations(true);
        const data = await locationService.getLocalitiesByDistrict(parseInt(formData.districtId));
        setLocalities(data);
      } catch (e) {
        console.error("Failed to load localities:", e);
        setLocalities([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocalities();
  }, [formData.districtId]);

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setFormData({
        firstName: patientData?.firstName || user.firstName || "",
        lastName: patientData?.lastName || user.lastName || "",
        phone: patientData?.phone || user.phone || "",
        gender: patientData?.gender !== undefined
          ? GenderDisplay[patientData.gender]
          : user.gender || "",
        dateOfBirth: patientData?.dateOfBirth?.split("T")[0] || user.dateOfBirth || "",
        country: patientData?.countryId?.toString() || user.country || "",
        governorateId: patientData?.governorateId?.toString() || user.governorateId || "",
        districtId: patientData?.districtId?.toString() || user.districtId || "",
        localityId: patientData?.localityId?.toString() || user.localityId || "",
        locale: patientData?.preferredLanguage || user.locale || "",
        bloodType: patientData?.bloodType || user.bloodType || "",
        specialty: user.specialty || "",
        medicalCertification: user.medicalCertification || "",
      });
    }
  }, [open, patientData, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileUpdateData, string>> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const updatedUser = await keycloakService.updateProfile(formData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      onProfileUpdated(updatedUser);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset dependent fields when parent changes
      if (field === "governorateId") {
        newData.districtId = "";
        newData.localityId = "";
      } else if (field === "districtId") {
        newData.localityId = "";
      }

      return newData;
    });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] lg:w-[50vw] lg:max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information. Email and user ID cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Email - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* User ID - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={user.id}
                disabled
                className="bg-muted cursor-not-allowed font-mono text-xs"
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                disabled={loading}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                disabled={loading}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                disabled={loading}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Select gender</option>
                {genderOptions.map((option, index) => (
                  <option key={option.code || option.id || index} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                disabled={loading}
                className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <select
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Select blood type</option>
                {bloodTypeOptions.map((type, index) => (
                  <option key={type.code || type.id || index} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Select country</option>
                {countries.map((country, index) => (
                  <option key={country.code || country.id || index} value={country.id?.toString()}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Governorate */}
            <div className="space-y-2">
              <Label htmlFor="governorateId">Governorate</Label>
              <select
                id="governorateId"
                value={formData.governorateId}
                onChange={(e) => handleInputChange("governorateId", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Select governorate</option>
                {governorates.map((gov, index) => (
                  <option key={gov.code || gov.id || index} value={gov.id?.toString()}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="districtId">District</Label>
              <select
                id="districtId"
                value={formData.districtId}
                onChange={(e) => handleInputChange("districtId", e.target.value)}
                disabled={loading || !formData.governorateId || loadingLocations}
                className={selectClassName}
              >
                <option value="">
                  {!formData.governorateId
                    ? "Select governorate first"
                    : loadingLocations
                      ? "Loading..."
                      : "Select district"}
                </option>
                {districts.map((district, index) => (
                  <option key={district.id || index} value={district.id?.toString()}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <Label htmlFor="localityId">Locality / City</Label>
              <select
                id="localityId"
                value={formData.localityId}
                onChange={(e) => handleInputChange("localityId", e.target.value)}
                disabled={loading || !formData.districtId || loadingLocations}
                className={selectClassName}
              >
                <option value="">
                  {!formData.districtId
                    ? "Select district first"
                    : loadingLocations
                      ? "Loading..."
                      : "Select locality"}
                </option>
                {localities.map((locality, index) => (
                  <option key={locality.id || index} value={locality.id?.toString()}>
                    {locality.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor-specific fields */}
            {user.role === "doctor" && (
              <>
                <div className="col-span-full">
                  <hr className="my-4" />
                  <h3 className="text-sm font-semibold">Professional Information</h3>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange("specialty", e.target.value)}
                    placeholder="Enter your medical specialty"
                    disabled={loading}
                  />
                </div>

                {/* Medical Certification */}
                <div className="space-y-2">
                  <Label htmlFor="medicalCertification">Medical Certification Number</Label>
                  <Input
                    id="medicalCertification"
                    value={formData.medicalCertification}
                    onChange={(e) => handleInputChange("medicalCertification", e.target.value)}
                    placeholder="Enter your certification number"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;

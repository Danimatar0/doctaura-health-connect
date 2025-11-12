import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScheduleSettings as ScheduleSettingsType, DaySchedule, Clinic, BlockedTimeSlot } from "@/types";
import { scheduleSettingsService } from "@/services/scheduleSettingsService";
import { blockedTimeService } from "@/services/blockedTimeService";
import BlockTimeDialog from "@/components/BlockTimeDialog";
import BlockedTimeList from "@/components/BlockedTimeList";
import { Clock, Save, AlertCircle, Loader2, Building2, MapPin, Phone, Ban, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ScheduleSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [settings, setSettings] = useState<ScheduleSettingsType | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Blocked time state
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch clinics first
        const clinicsData = await scheduleSettingsService.getClinics();
        setClinics(clinicsData);

        // Select first clinic by default
        if (clinicsData.length > 0) {
          setSelectedClinicId(clinicsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load clinics. Please try again later.");
        toast.error("Failed to load clinics");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch schedule settings when clinic selection changes
  useEffect(() => {
    const fetchScheduleSettings = async () => {
      if (!selectedClinicId) return;

      try {
        const data = await scheduleSettingsService.getScheduleSettingsByClinic(selectedClinicId);
        setSettings(data);
      } catch (err) {
        console.error("Error fetching schedule settings:", err);
        toast.error("Failed to load schedule settings for this clinic");
      }
    };

    fetchScheduleSettings();
  }, [selectedClinicId]);

  // Fetch blocked time slots when clinic selection changes
  useEffect(() => {
    const fetchBlockedTimeSlots = async () => {
      if (!selectedClinicId) return;

      try {
        setLoadingBlocked(true);
        const data = await blockedTimeService.getBlockedTimeSlots(selectedClinicId);
        setBlockedSlots(data);
      } catch (err) {
        console.error("Error fetching blocked time slots:", err);
        toast.error("Failed to load blocked time slots");
      } finally {
        setLoadingBlocked(false);
      }
    };

    fetchBlockedTimeSlots();
  }, [selectedClinicId]);

  const validateSettings = (): boolean => {
    const errors: Record<string, string> = {};

    if (!settings) return false;

    // Validate appointment duration
    if (![15, 30, 45, 60].includes(settings.appointmentDuration)) {
      errors.appointmentDuration = "Please select a valid appointment duration";
    }

    // Validate each day's schedule
    daysOfWeek.forEach(({ key }) => {
      const schedule = settings.weeklySchedule[key as keyof typeof settings.weeklySchedule];

      if (schedule.isAvailable) {
        const startTime = schedule.startTime;
        const endTime = schedule.endTime;

        // Check if times are provided
        if (!startTime || !endTime) {
          errors[key] = "Please provide start and end times";
          return;
        }

        // Convert times to minutes for comparison
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        // Validate end time is after start time
        if (endTotalMinutes <= startTotalMinutes) {
          errors[key] = "End time must be after start time";
        }

        // Validate minimum working hours (at least 1 hour)
        if (endTotalMinutes - startTotalMinutes < 60) {
          errors[key] = "Working hours must be at least 1 hour";
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!settings) return;

    // Validate before saving
    if (!validateSettings()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      setSaving(true);
      const updatedSettings = await scheduleSettingsService.updateScheduleSettings(settings);
      setSettings(updatedSettings);
      toast.success("Schedule settings saved successfully!");
      setValidationErrors({});
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      weeklySchedule: {
        ...settings.weeklySchedule,
        [day]: {
          ...settings.weeklySchedule[day as keyof typeof settings.weeklySchedule],
          ...updates,
        },
      },
    });

    // Clear validation error for this day when user makes changes
    if (validationErrors[day]) {
      const newErrors = { ...validationErrors };
      delete newErrors[day];
      setValidationErrors(newErrors);
    }
  };

  const updateAppointmentDuration = (duration: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      appointmentDuration: duration,
    });

    // Clear validation error
    if (validationErrors.appointmentDuration) {
      const newErrors = { ...validationErrors };
      delete newErrors.appointmentDuration;
      setValidationErrors(newErrors);
    }
  };

  // Blocked time handlers
  const handleCreateBlockedTime = async (blockData: Omit<BlockedTimeSlot, "id" | "doctorId" | "createdAt">) => {
    try {
      const newSlot = await blockedTimeService.createBlockedTimeSlot({
        ...blockData,
        doctorId: "doc-1", // This should come from auth context in production
      });
      setBlockedSlots([...blockedSlots, newSlot]);
      toast.success("Time slot blocked successfully!");
    } catch (err) {
      console.error("Error creating blocked time slot:", err);
      toast.error("Failed to block time slot. Please try again.");
    }
  };

  const handleDeleteBlockedTime = async (id: string) => {
    try {
      await blockedTimeService.deleteBlockedTimeSlot(id);
      setBlockedSlots(blockedSlots.filter(slot => slot.id !== id));
      toast.success("Blocked time removed successfully!");
    } catch (err) {
      console.error("Error deleting blocked time slot:", err);
      toast.error("Failed to remove blocked time. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading your schedule settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-destructive font-semibold">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Sidebar />

      <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Schedule Settings</h1>
            <p className="text-lg text-muted-foreground">
              Manage your availability and appointment preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Clinic Selector Card */}
            <Card className="shadow-soft border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Select Clinic
                </CardTitle>
                <CardDescription>
                  Choose which clinic you want to manage the schedule for
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Clinic Selector */}
                  <div className="space-y-3">
                    <Label htmlFor="clinic-select" className="text-base font-semibold">
                      Clinic
                    </Label>
                    <Select
                      value={selectedClinicId}
                      onValueChange={setSelectedClinicId}
                    >
                      <SelectTrigger
                        id="clinic-select"
                        className="w-full h-12 text-base"
                      >
                        <SelectValue placeholder="Select a clinic" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="font-medium">{clinic.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Clinic Details */}
                  {selectedClinicId && clinics.find(c => c.id === selectedClinicId) && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Clinic Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium">
                              {clinics.find(c => c.id === selectedClinicId)?.address}
                            </p>
                            <p className="text-muted-foreground">
                              {clinics.find(c => c.id === selectedClinicId)?.city},{" "}
                              {clinics.find(c => c.id === selectedClinicId)?.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm font-medium">
                            {clinics.find(c => c.id === selectedClinicId)?.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings Card */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Appointment Configuration
                </CardTitle>
                <CardDescription>
                  Configure your default appointment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Appointment Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-base font-semibold">
                    Appointment Duration
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    How long should each appointment last?
                  </p>
                  <Select
                    value={settings.appointmentDuration.toString()}
                    onValueChange={(value) => updateAppointmentDuration(parseInt(value))}
                  >
                    <SelectTrigger
                      id="duration"
                      className={cn(
                        "w-full",
                        validationErrors.appointmentDuration && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.appointmentDuration && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.appointmentDuration}
                    </p>
                  )}
                </div>

                {/* Buffer Time */}
                <div className="space-y-2">
                  <Label htmlFor="buffer" className="text-base font-semibold">
                    Buffer Time (minutes)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Break time between consecutive appointments
                  </p>
                  <Input
                    id="buffer"
                    type="number"
                    value={settings.bufferTime}
                    onChange={(e) =>
                      setSettings({ ...settings, bufferTime: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    max="60"
                    step="5"
                    className="w-full"
                  />
                </div>

                {/* Max Patients */}
                <div className="space-y-2">
                  <Label htmlFor="maxPatients" className="text-base font-semibold">
                    Maximum Patients Per Day
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Limit the number of daily appointments
                  </p>
                  <Input
                    id="maxPatients"
                    type="number"
                    value={settings.maxPatientsPerDay}
                    onChange={(e) =>
                      setSettings({ ...settings, maxPatientsPerDay: parseInt(e.target.value) || 1 })
                    }
                    min="1"
                    max="100"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule Card */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>
                  Set your working hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {daysOfWeek.map(({ key, label }) => {
                    const schedule = settings.weeklySchedule[key as keyof typeof settings.weeklySchedule];
                    const hasError = validationErrors[key];

                    return (
                      <div
                        key={key}
                        className={cn(
                          "pb-4 border-b last:border-b-0 transition-smooth",
                          hasError && "border-destructive/30"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Day name and toggle */}
                          <div className="flex items-center gap-3 sm:w-48">
                            <Switch
                              checked={schedule.isAvailable}
                              onCheckedChange={(checked) =>
                                updateDaySchedule(key, { isAvailable: checked })
                              }
                              className="data-[state=checked]:bg-primary"
                            />
                            <Label className="font-semibold text-base cursor-pointer">
                              {label}
                            </Label>
                          </div>

                          {/* Time inputs */}
                          {schedule.isAvailable ? (
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex-1">
                                <Input
                                  type="time"
                                  value={schedule.startTime}
                                  onChange={(e) =>
                                    updateDaySchedule(key, { startTime: e.target.value })
                                  }
                                  className={cn(hasError && "border-destructive")}
                                />
                              </div>
                              <span className="text-muted-foreground font-medium">to</span>
                              <div className="flex-1">
                                <Input
                                  type="time"
                                  value={schedule.endTime}
                                  onChange={(e) =>
                                    updateDaySchedule(key, { endTime: e.target.value })
                                  }
                                  className={cn(hasError && "border-destructive")}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                          )}
                        </div>

                        {/* Validation error message */}
                        {hasError && (
                          <p className="text-sm text-destructive flex items-center gap-1 mt-2 ml-11">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors[key]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Blocked Time Section */}
            <Card className="shadow-soft border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ban className="h-5 w-5 text-orange-600" />
                      Blocked Time Slots
                    </CardTitle>
                    <CardDescription>
                      Block time when you're unavailable for appointments
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setBlockDialogOpen(true)}
                    className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block Time
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingBlocked ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading blocked time slots...</p>
                  </div>
                ) : (
                  <BlockedTimeList
                    blockedSlots={blockedSlots}
                    onDelete={handleDeleteBlockedTime}
                  />
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth min-w-[140px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Block Time Dialog */}
      <BlockTimeDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        onSave={handleCreateBlockedTime}
        clinicId={selectedClinicId}
      />
    </div>
  );
};

export default ScheduleSettings;

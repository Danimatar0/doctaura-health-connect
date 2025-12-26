import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Calendar,
  Shield,
  Eye,
  Volume2,
  Vibrate,
  Save,
  RotateCcw,
  Check,
} from "lucide-react";

// Mock preferences data
interface UserPreferences {
  // Appearance
  language: string;
  theme: "light" | "dark" | "system";

  // Notifications
  notifications: {
    email: {
      enabled: boolean;
      appointments: boolean;
      reminders: boolean;
      promotions: boolean;
      newsletter: boolean;
    };
    push: {
      enabled: boolean;
      appointments: boolean;
      reminders: boolean;
      messages: boolean;
    };
    sms: {
      enabled: boolean;
      appointments: boolean;
      reminders: boolean;
    };
  };

  // Reminders
  appointmentReminder: string; // "15min" | "30min" | "1hour" | "1day"

  // Privacy
  privacy: {
    showProfilePhoto: boolean;
    showOnlineStatus: boolean;
    allowDataAnalytics: boolean;
  };

  // Accessibility
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
    screenReaderOptimized: boolean;
  };

  // Calendar
  calendarSync: boolean;
  defaultCalendarView: "day" | "week" | "month";
}

const defaultPreferences: UserPreferences = {
  language: "en",
  theme: "system",
  notifications: {
    email: {
      enabled: true,
      appointments: true,
      reminders: true,
      promotions: false,
      newsletter: false,
    },
    push: {
      enabled: true,
      appointments: true,
      reminders: true,
      messages: true,
    },
    sms: {
      enabled: false,
      appointments: true,
      reminders: false,
    },
  },
  appointmentReminder: "1hour",
  privacy: {
    showProfilePhoto: true,
    showOnlineStatus: false,
    allowDataAnalytics: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
  },
  calendarSync: false,
  defaultCalendarView: "week",
};

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

const reminderOptions = [
  { value: "15min", label: "15 minutes before" },
  { value: "30min", label: "30 minutes before" },
  { value: "1hour", label: "1 hour before" },
  { value: "1day", label: "1 day before" },
];

const Preferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNestedPreference = (
    category: "notifications" | "privacy" | "accessibility",
    subCategory: string,
    key: string,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: typeof prev[category][subCategory as keyof typeof prev[typeof category]] === "object"
          ? { ...(prev[category][subCategory as keyof typeof prev[typeof category]] as object), [key]: value }
          : value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
    toast({
      title: "Preferences reset",
      description: "All preferences have been reset to defaults.",
    });
  };

  const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Sidebar />

      <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Preferences</h1>
              <p className="text-muted-foreground mt-1">
                Customize your experience and manage your settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  Unsaved changes
                </Badge>
              )}
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges || saving}>
                {saving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
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

          <div className="space-y-6">
            {/* Language & Appearance */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Language & Appearance</CardTitle>
                    <CardDescription>Choose your language and visual preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Language</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => updatePreference("language", lang.code)}
                        className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[80px] overflow-hidden ${
                          preferences.language === lang.code
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium text-sm truncate max-w-full">{lang.name}</span>
                        {preferences.language === lang.code && (
                          <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light", label: "Light", icon: Sun, description: "Bright and clear" },
                      { value: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
                      { value: "system", label: "System", icon: Monitor, description: "Match your device" },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => updatePreference("theme", theme.value as UserPreferences["theme"])}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          preferences.theme === theme.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className={`p-3 rounded-full ${
                          preferences.theme === theme.value ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <theme.icon className={`h-6 w-6 ${
                            preferences.theme === theme.value ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <span className="font-medium">{theme.label}</span>
                        <span className="text-xs text-muted-foreground">{theme.description}</span>
                        {preferences.theme === theme.value && (
                          <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Bell className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage how you receive updates and alerts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Mail className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications.email.enabled}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: { ...prev.notifications.email, enabled: checked },
                          },
                        }))
                      }
                    />
                  </div>
                  {preferences.notifications.email.enabled && (
                    <div className="ml-12 space-y-3 animate-in slide-in-from-top-2">
                      {[
                        { key: "appointments", label: "Appointment confirmations & updates" },
                        { key: "reminders", label: "Appointment reminders" },
                        { key: "promotions", label: "Promotions & offers" },
                        { key: "newsletter", label: "Health tips & newsletter" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <span className="text-sm">{item.label}</span>
                          <Switch
                            checked={preferences.notifications.email[item.key as keyof typeof preferences.notifications.email] as boolean}
                            onCheckedChange={(checked) =>
                              setPreferences((prev) => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  email: { ...prev.notifications.email, [item.key]: checked },
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Push Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Smartphone className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive instant alerts on your device</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications.push.enabled}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            push: { ...prev.notifications.push, enabled: checked },
                          },
                        }))
                      }
                    />
                  </div>
                  {preferences.notifications.push.enabled && (
                    <div className="ml-12 space-y-3 animate-in slide-in-from-top-2">
                      {[
                        { key: "appointments", label: "Appointment updates" },
                        { key: "reminders", label: "Reminders" },
                        { key: "messages", label: "New messages from doctors" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <span className="text-sm">{item.label}</span>
                          <Switch
                            checked={preferences.notifications.push[item.key as keyof typeof preferences.notifications.push] as boolean}
                            onCheckedChange={(checked) =>
                              setPreferences((prev) => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  push: { ...prev.notifications.push, [item.key]: checked },
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* SMS Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">SMS Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive text messages (charges may apply)</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications.sms.enabled}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            sms: { ...prev.notifications.sms, enabled: checked },
                          },
                        }))
                      }
                    />
                  </div>
                  {preferences.notifications.sms.enabled && (
                    <div className="ml-12 space-y-3 animate-in slide-in-from-top-2">
                      {[
                        { key: "appointments", label: "Appointment confirmations" },
                        { key: "reminders", label: "Appointment reminders" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <span className="text-sm">{item.label}</span>
                          <Switch
                            checked={preferences.notifications.sms[item.key as keyof typeof preferences.notifications.sms] as boolean}
                            onCheckedChange={(checked) =>
                              setPreferences((prev) => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  sms: { ...prev.notifications.sms, [item.key]: checked },
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Reminders */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Clock className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <CardTitle>Appointment Reminders</CardTitle>
                    <CardDescription>Set when you want to be reminded about appointments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {reminderOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updatePreference("appointmentReminder", option.value)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        preferences.appointmentReminder === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <Clock className={`h-5 w-5 ${
                        preferences.appointmentReminder === option.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <span className="text-sm font-medium text-center">{option.label}</span>
                      {preferences.appointmentReminder === option.value && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar & Scheduling */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle>Calendar & Scheduling</CardTitle>
                    <CardDescription>Manage your calendar integration and view preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Sync with device calendar</Label>
                    <p className="text-xs text-muted-foreground">
                      Add appointments to your phone's calendar
                    </p>
                  </div>
                  <Switch
                    checked={preferences.calendarSync}
                    onCheckedChange={(checked) => updatePreference("calendarSync", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Default Calendar View</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                    ].map((view) => (
                      <button
                        key={view.value}
                        onClick={() => updatePreference("defaultCalendarView", view.value as UserPreferences["defaultCalendarView"])}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          preferences.defaultCalendarView === view.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10">
                    <Shield className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>Control your privacy and data sharing settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "showProfilePhoto",
                    icon: Eye,
                    label: "Show profile photo",
                    description: "Allow others to see your profile picture",
                  },
                  {
                    key: "showOnlineStatus",
                    icon: Vibrate,
                    label: "Show online status",
                    description: "Let others see when you're online",
                  },
                  {
                    key: "allowDataAnalytics",
                    icon: Volume2,
                    label: "Help improve our services",
                    description: "Share anonymous usage data to help us improve",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium">{item.label}</Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.privacy[item.key as keyof typeof preferences.privacy]}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, [item.key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Eye className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle>Accessibility</CardTitle>
                    <CardDescription>Customize the app to meet your accessibility needs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "reducedMotion",
                    label: "Reduce motion",
                    description: "Minimize animations throughout the app",
                  },
                  {
                    key: "highContrast",
                    label: "High contrast",
                    description: "Increase contrast for better visibility",
                  },
                  {
                    key: "largeText",
                    label: "Large text",
                    description: "Use larger text throughout the app",
                  },
                  {
                    key: "screenReaderOptimized",
                    label: "Screen reader optimized",
                    description: "Optimize for screen reader compatibility",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm font-medium">{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={preferences.accessibility[item.key as keyof typeof preferences.accessibility]}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          accessibility: { ...prev.accessibility, [item.key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Floating Save Bar */}
          {hasChanges && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 ml-32 z-50 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4 px-6 py-3 bg-background border rounded-full shadow-lg">
                <span className="text-sm text-muted-foreground">You have unsaved changes</span>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Preferences;

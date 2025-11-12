import { useState } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import AppointmentCalendar, {
  CalendarView,
  GenericAppointment,
} from "./AppointmentCalendar";
import AppointmentListView from "./AppointmentListView";

interface AppointmentsPageProps {
  appointments: GenericAppointment[];
  loading?: boolean;
  error?: string | null;
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

const AppointmentsPage = ({
  appointments,
  loading = false,
  error = null,
  onAppointmentClick,
  renderAppointmentContent,
  pageTitle = "My Appointments",
  pageDescription = "View and manage all your appointments",
}: AppointmentsPageProps) => {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading appointments...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Sidebar />

      <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold">{pageTitle}</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  {pageDescription}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  onClick={() => setViewMode("calendar")}
                  className="gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {viewMode === "calendar" ? (
            <AppointmentCalendar
              appointments={appointments}
              view={calendarView}
              onViewChange={setCalendarView}
              onAppointmentClick={onAppointmentClick}
              renderAppointmentContent={renderAppointmentContent}
            />
          ) : (
            <AppointmentListView
              appointments={appointments}
              onAppointmentClick={onAppointmentClick}
              renderAppointmentContent={renderAppointmentContent}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentsPage;

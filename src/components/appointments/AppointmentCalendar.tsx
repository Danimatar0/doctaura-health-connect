import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week" | "day" | "hour";

export interface GenericAppointment {
  id: string;
  date: string; // ISO date string
  time: string; // e.g., "10:00 AM"
  status: "upcoming" | "completed" | "cancelled";
  type: "in-person" | "video";
  // Patient view fields
  doctorName?: string;
  specialty?: string;
  // Doctor view fields
  patientName?: string;
  reason?: string;
  // Common fields
  location?: string;
}

interface AppointmentCalendarProps {
  appointments: GenericAppointment[];
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
}

const AppointmentCalendar = ({
  appointments,
  view,
  onViewChange,
  onAppointmentClick,
  renderAppointmentContent,
}: AppointmentCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation handlers
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "day":
      case "hour":
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "day":
      case "hour":
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get title based on view
  const getTitle = () => {
    const options: Intl.DateTimeFormatOptions = {};
    switch (view) {
      case "month":
        return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      case "week":
        const weekStart = getWeekStart(currentDate);
        const weekEnd = getWeekEnd(currentDate);
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      case "day":
      case "hour":
        return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
  };

  // Helper functions for week calculation
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  // Render different views
  const renderView = () => {
    switch (view) {
      case "month":
        return <MonthView currentDate={currentDate} appointments={appointments} onAppointmentClick={onAppointmentClick} renderAppointmentContent={renderAppointmentContent} />;
      case "week":
        return <WeekView currentDate={currentDate} appointments={appointments} onAppointmentClick={onAppointmentClick} renderAppointmentContent={renderAppointmentContent} />;
      case "day":
        return <DayView currentDate={currentDate} appointments={appointments} onAppointmentClick={onAppointmentClick} renderAppointmentContent={renderAppointmentContent} />;
      case "hour":
        return <HourView currentDate={currentDate} appointments={appointments} onAppointmentClick={onAppointmentClick} renderAppointmentContent={renderAppointmentContent} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold ml-2">{getTitle()}</h2>
        </div>

        {/* View Switcher */}
        <div className="flex gap-1">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("month")}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("week")}
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("day")}
          >
            Day
          </Button>
          <Button
            variant={view === "hour" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("hour")}
          >
            Hour
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {renderView()}
    </div>
  );
};

// Month View Component
const MonthView = ({
  currentDate,
  appointments,
  onAppointmentClick,
  renderAppointmentContent
}: {
  currentDate: Date;
  appointments: GenericAppointment[];
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
}) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-muted/20" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    const dateStr = date.toISOString().split("T")[0];

    const dayAppointments = appointments.filter(apt => apt.date === dateStr);

    days.push(
      <div
        key={day}
        className={cn(
          "min-h-[100px] border border-border p-2 bg-card hover:bg-accent/5 transition-colors",
          isToday && "border-primary border-2 bg-primary/5"
        )}
      >
        <div className={cn("text-sm font-medium mb-1", isToday && "text-primary")}>
          {day}
        </div>
        <div className="space-y-1">
          {dayAppointments.slice(0, 3).map((apt) => (
            <div
              key={apt.id}
              onClick={() => onAppointmentClick?.(apt)}
              className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer truncate"
            >
              {apt.time} - {apt.doctorName || apt.patientName}
            </div>
          ))}
          {dayAppointments.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayAppointments.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-7 gap-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium text-sm p-2 border-b">
            {day}
          </div>
        ))}
        {days}
      </div>
    </Card>
  );
};

// Week View Component
const WeekView = ({
  currentDate,
  appointments,
  onAppointmentClick,
  renderAppointmentContent
}: {
  currentDate: Date;
  appointments: GenericAppointment[];
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
}) => {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="grid grid-cols-8 gap-0 min-w-[800px]">
        {/* Header */}
        <div className="sticky left-0 bg-card z-10" />
        {days.map((day, idx) => {
          const isToday = day.getTime() === today.getTime();
          return (
            <div
              key={idx}
              className={cn(
                "text-center p-2 border-b font-medium",
                isToday && "bg-primary/10 text-primary"
              )}
            >
              <div className="text-xs">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className="text-lg">{day.getDate()}</div>
            </div>
          );
        })}

        {/* Time slots */}
        {hours.filter(h => h >= 6 && h <= 22).map((hour) => (
          <>
            <div key={`time-${hour}`} className="text-xs text-muted-foreground p-2 border-r sticky left-0 bg-card">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>
            {days.map((day, dayIdx) => {
              const dateStr = day.toISOString().split("T")[0];
              const slotAppointments = appointments.filter(apt => {
                if (apt.date !== dateStr) return false;
                const aptHour = parseInt(apt.time.split(":")[0]);
                const isPM = apt.time.toLowerCase().includes("pm");
                const hour24 = isPM && aptHour !== 12 ? aptHour + 12 : !isPM && aptHour === 12 ? 0 : aptHour;
                return hour24 === hour;
              });

              return (
                <div
                  key={`${day}-${hour}`}
                  className="min-h-[60px] border border-border p-1 hover:bg-accent/5 transition-colors"
                >
                  {slotAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={cn(
                        "text-xs p-1 rounded mb-1 cursor-pointer",
                        apt.status === "upcoming" && "bg-primary/20 hover:bg-primary/30",
                        apt.status === "completed" && "bg-green-500/20 hover:bg-green-500/30",
                        apt.status === "cancelled" && "bg-destructive/20 hover:bg-destructive/30"
                      )}
                    >
                      <div className="font-medium truncate">
                        {apt.time}
                      </div>
                      <div className="truncate">
                        {apt.doctorName || apt.patientName}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </Card>
  );
};

// Day View Component
const DayView = ({
  currentDate,
  appointments,
  onAppointmentClick,
  renderAppointmentContent
}: {
  currentDate: Date;
  appointments: GenericAppointment[];
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
}) => {
  const dateStr = currentDate.toISOString().split("T")[0];
  const dayAppointments = appointments.filter(apt => apt.date === dateStr);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="p-4">
      <div className="space-y-2">
        {hours.filter(h => h >= 6 && h <= 22).map((hour) => {
          const hourAppointments = dayAppointments.filter(apt => {
            const aptHour = parseInt(apt.time.split(":")[0]);
            const isPM = apt.time.toLowerCase().includes("pm");
            const hour24 = isPM && aptHour !== 12 ? aptHour + 12 : !isPM && aptHour === 12 ? 0 : aptHour;
            return hour24 === hour;
          });

          return (
            <div key={hour} className="flex gap-4 min-h-[80px] border-b last:border-b-0">
              <div className="w-24 text-sm text-muted-foreground font-medium pt-2">
                {hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`}
              </div>
              <div className="flex-1 space-y-2 py-2">
                {hourAppointments.length > 0 ? (
                  hourAppointments.map((apt) => (
                    <Card
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={cn(
                        "p-3 cursor-pointer hover:shadow-md transition-shadow",
                        apt.status === "upcoming" && "border-l-4 border-l-primary",
                        apt.status === "completed" && "border-l-4 border-l-green-500",
                        apt.status === "cancelled" && "border-l-4 border-l-destructive opacity-60"
                      )}
                    >
                      {renderAppointmentContent ? (
                        renderAppointmentContent(apt)
                      ) : (
                        <DefaultAppointmentCard appointment={apt} />
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic py-4">No appointments</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Hour View Component (Focused hourly breakdown)
const HourView = ({
  currentDate,
  appointments,
  onAppointmentClick,
  renderAppointmentContent
}: {
  currentDate: Date;
  appointments: GenericAppointment[];
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
}) => {
  const dateStr = currentDate.toISOString().split("T")[0];
  const dayAppointments = appointments.filter(apt => apt.date === dateStr);
  const currentHour = new Date().getHours();

  // Show current hour +/- 3 hours
  const startHour = Math.max(6, currentHour - 3);
  const endHour = Math.min(22, currentHour + 4);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {hours.map((hour) => {
          const hourAppointments = dayAppointments.filter(apt => {
            const aptHour = parseInt(apt.time.split(":")[0]);
            const isPM = apt.time.toLowerCase().includes("pm");
            const hour24 = isPM && aptHour !== 12 ? aptHour + 12 : !isPM && aptHour === 12 ? 0 : aptHour;
            return hour24 === hour;
          });

          const isCurrentHour = hour === currentHour;

          return (
            <div
              key={hour}
              className={cn(
                "p-4 rounded-lg border-2",
                isCurrentHour ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={cn("text-lg font-semibold", isCurrentHour && "text-primary")}>
                  {hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`}
                  {isCurrentHour && <Badge className="ml-2" variant="default">Now</Badge>}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {hourAppointments.length} appointment{hourAppointments.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {hourAppointments.length > 0 ? (
                  hourAppointments.map((apt) => (
                    <Card
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
                    >
                      {renderAppointmentContent ? (
                        renderAppointmentContent(apt)
                      ) : (
                        <DefaultAppointmentCard appointment={apt} />
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground italic py-6">
                    No appointments scheduled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Default Appointment Card
const DefaultAppointmentCard = ({ appointment }: { appointment: GenericAppointment }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-semibold">
          {appointment.doctorName || appointment.patientName}
        </span>
        <Badge variant={appointment.status === "upcoming" ? "default" : appointment.status === "completed" ? "secondary" : "destructive"}>
          {appointment.status}
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        {appointment.time} • {appointment.type === "video" ? "Video Call" : "In-Person"}
      </div>
      {appointment.specialty && (
        <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
      )}
      {appointment.reason && (
        <div className="text-sm text-muted-foreground">Reason: {appointment.reason}</div>
      )}
      {appointment.location && appointment.type === "in-person" && (
        <div className="text-sm text-muted-foreground">📍 {appointment.location}</div>
      )}
    </div>
  );
};

export default AppointmentCalendar;

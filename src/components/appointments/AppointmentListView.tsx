import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GenericAppointment } from "./AppointmentCalendar";

interface AppointmentListViewProps {
  appointments: GenericAppointment[];
  onAppointmentClick?: (appointment: GenericAppointment) => void;
  renderAppointmentContent?: (appointment: GenericAppointment) => React.ReactNode;
}

interface GroupedAppointments {
  date: Date;
  dateStr: string;
  appointments: GenericAppointment[];
}

const AppointmentListView = ({
  appointments,
  onAppointmentClick,
  renderAppointmentContent,
}: AppointmentListViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Group appointments by day
  const groupedAppointments = useMemo(() => {
    // Filter appointments
    let filtered = appointments;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.doctorName?.toLowerCase().includes(query) ||
          apt.patientName?.toLowerCase().includes(query) ||
          apt.specialty?.toLowerCase().includes(query) ||
          apt.reason?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Group by date
    const groups = new Map<string, GenericAppointment[]>();
    filtered.forEach((apt) => {
      const existing = groups.get(apt.date) || [];
      existing.push(apt);
      groups.set(apt.date, existing);
    });

    // Convert to array and sort by date
    const result: GroupedAppointments[] = Array.from(groups.entries())
      .map(([dateStr, apts]) => ({
        date: new Date(dateStr),
        dateStr,
        appointments: apts.sort((a, b) => {
          // Sort by time
          const timeA = parseTime(a.time);
          const timeB = parseTime(b.time);
          return timeA - timeB;
        }),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return result;
  }, [appointments, searchQuery, statusFilter]);

  // Auto-expand upcoming dates
  useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = groupedAppointments
      .filter((group) => group.date >= today)
      .slice(0, 3)
      .map((group) => group.dateStr);
    setExpandedDays(new Set(upcoming));
  }, [groupedAppointments]);

  const toggleDay = (dateStr: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  const parseTime = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let hour24 = hours;
    if (period?.toLowerCase() === "pm" && hours !== 12) hour24 += 12;
    if (period?.toLowerCase() === "am" && hours === 12) hour24 = 0;
    return hour24 * 60 + (minutes || 0);
  };

  const formatDateHeader = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      return "Today";
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {appointments.filter((a) => a.status === "upcoming").length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Upcoming</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {appointments.filter((a) => a.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {appointments.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Appointments */}
      {groupedAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You don't have any appointments scheduled yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groupedAppointments.map((group) => {
            const isExpanded = expandedDays.has(group.dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = group.date < today;

            return (
              <Card key={group.dateStr} className={cn(isPast && "opacity-75")}>
                <CardHeader
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleDay(group.dateStr)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          {formatDateHeader(group.date)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.date.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {group.appointments.length} appointment
                        {group.appointments.length !== 1 ? "s" : ""}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {group.appointments.map((appointment) => (
                        <Card
                          key={appointment.id}
                          className={cn(
                            "hover:shadow-md transition-shadow cursor-pointer border-l-4",
                            appointment.status === "upcoming" &&
                              "border-l-primary hover:border-l-primary/80",
                            appointment.status === "completed" &&
                              "border-l-green-500 hover:border-l-green-500/80",
                            appointment.status === "cancelled" &&
                              "border-l-destructive hover:border-l-destructive/80"
                          )}
                          onClick={() => onAppointmentClick?.(appointment)}
                        >
                          <CardContent className="p-4">
                            {renderAppointmentContent ? (
                              renderAppointmentContent(appointment)
                            ) : (
                              <DefaultListItem appointment={appointment} />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Default List Item Component
const DefaultListItem = ({ appointment }: { appointment: GenericAppointment }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-base">
            {appointment.doctorName || appointment.patientName}
          </h4>
          <Badge
            variant={
              appointment.status === "upcoming"
                ? "default"
                : appointment.status === "completed"
                ? "secondary"
                : "destructive"
            }
          >
            {appointment.status}
          </Badge>
          <Badge variant="outline">
            {appointment.type === "video" ? (
              <>
                <Video className="h-3 w-3 mr-1" />
                Video Call
              </>
            ) : (
              <>
                <MapPin className="h-3 w-3 mr-1" />
                In-Person
              </>
            )}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{appointment.time}</span>
          </div>

          {appointment.specialty && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>{appointment.specialty}</span>
            </div>
          )}

          {appointment.reason && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>{appointment.reason}</span>
            </div>
          )}

          {appointment.location && appointment.type === "in-person" && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{appointment.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
};

export default AppointmentListView;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentsPage from "@/components/appointments/AppointmentsPage";
import { GenericAppointment } from "@/components/appointments/AppointmentCalendar";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Video, User, FileText } from "lucide-react";

// Mock data for doctor appointments - replace with actual API call
const mockDoctorAppointments = [
  {
    id: "1",
    patientId: "patient-001",
    patientName: "Sarah Johnson",
    reason: "Annual checkup",
    date: "2025-01-15",
    time: "9:00 AM",
    status: "upcoming" as const,
    type: "in-person" as const,
    location: "Clinic Room 3",
  },
  {
    id: "2",
    patientId: "patient-002",
    patientName: "Michael Chen",
    reason: "Follow-up consultation",
    date: "2025-01-15",
    time: "10:30 AM",
    status: "upcoming" as const,
    type: "video" as const,
  },
  {
    id: "3",
    patientId: "patient-003",
    patientName: "Emma Davis",
    reason: "Vaccination",
    date: "2025-01-16",
    time: "2:00 PM",
    status: "upcoming" as const,
    type: "in-person" as const,
    location: "Clinic Room 1",
  },
  {
    id: "4",
    patientId: "patient-004",
    patientName: "James Wilson",
    reason: "Blood pressure monitoring",
    date: "2025-01-10",
    time: "11:00 AM",
    status: "completed" as const,
    type: "in-person" as const,
    location: "Clinic Room 2",
  },
];

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<GenericAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Convert to generic appointment format
        const genericAppointments: GenericAppointment[] = mockDoctorAppointments.map(
          (apt) => ({
            id: apt.id,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            type: apt.type,
            patientName: apt.patientName,
            reason: apt.reason,
            location: apt.location,
          })
        );

        setAppointments(genericAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleAppointmentClick = (appointment: GenericAppointment) => {
    // You can navigate to appointment details or open a modal
    console.log("Clicked appointment:", appointment);
    // navigate(`/doctor/appointments/${appointment.id}`);
  };

  // Custom render function for doctor appointments
  const renderDoctorAppointment = (appointment: GenericAppointment) => {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <User className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-base">{appointment.patientName}</h4>
              {appointment.reason && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{appointment.reason}</span>
                </div>
              )}
            </div>
          </div>
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
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{appointment.time}</span>
          </div>

          {appointment.type === "video" ? (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>Video Call</span>
            </div>
          ) : (
            appointment.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{appointment.location}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <AppointmentsPage
      appointments={appointments}
      loading={loading}
      error={error}
      onAppointmentClick={handleAppointmentClick}
      renderAppointmentContent={renderDoctorAppointment}
      pageTitle="My Appointments"
      pageDescription="View and manage your patient appointments"
    />
  );
};

export default DoctorAppointments;

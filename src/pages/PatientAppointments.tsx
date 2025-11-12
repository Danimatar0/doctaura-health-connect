import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentsPage from "@/components/appointments/AppointmentsPage";
import { GenericAppointment } from "@/components/appointments/AppointmentCalendar";
import { patientDataService } from "@/services/patientDataService";
import { Appointment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Video, User } from "lucide-react";

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<GenericAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await patientDataService.getAppointments();

        // Convert to generic appointment format
        const genericAppointments: GenericAppointment[] = data.map((apt: Appointment) => ({
          id: apt.id,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          type: apt.type,
          doctorName: apt.doctorName,
          specialty: apt.specialty,
          location: apt.location,
        }));

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
    // navigate(`/patient/appointments/${appointment.id}`);
  };

  // Custom render function for patient appointments
  const renderPatientAppointment = (appointment: GenericAppointment) => {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <User className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-base">{appointment.doctorName}</h4>
              {appointment.specialty && (
                <p className="text-sm text-primary">{appointment.specialty}</p>
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
      renderAppointmentContent={renderPatientAppointment}
      pageTitle="My Appointments"
      pageDescription="View and manage all your medical appointments"
    />
  );
};

export default PatientAppointments;

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  languages: string[];
  availability: string[];
  image: string;
  experience: number;
  education: string;
  about: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  location?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalHistory: string[];
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  image: string;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  services: string[];
  medications: string[];
  isOpen24Hours: boolean;
  deliveryAvailable: boolean;
  acceptsInsurance: boolean;
}

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  diagnosis?: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  type: 'visit' | 'lab' | 'imaging' | 'procedure' | 'vaccination';
  title: string;
  date: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  facility?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  labResults?: {
    test: string;
    result: string;
    normalRange?: string;
    status: 'normal' | 'abnormal' | 'critical';
  }[];
  imagingResults?: {
    type: string;
    findings: string;
    images?: string[];
  };
  prescriptions?: string[];
  followUpDate?: string;
  notes?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

// Doctor-specific types
export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  reason: string; // reason for appointment (consultation, checkup, etc.)
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  location?: string;
}

export interface DoctorStats {
  todayAppointments: number;
  totalPatients: number;
  weekAppointments: number;
  monthlyRevenue: number;
}

export interface WeeklySchedule {
  day: string;
  appointmentCount: number;
}

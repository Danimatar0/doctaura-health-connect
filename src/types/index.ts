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

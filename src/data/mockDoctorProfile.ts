import { Doctor, DoctorStats } from "@/types";

export const mockDoctorProfile: Doctor = {
  id: "doc-001",
  name: "Dr. Johnson",
  specialty: "Cardiology",
  location: "Beirut",
  rating: 4.9,
  reviewCount: 245,
  price: 50,
  languages: ["English", "Arabic"],
  availability: ["Monday", "Wednesday", "Friday"],
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
  experience: 12,
  education: "American University of Beirut",
  about: "Specialized in preventive cardiology and heart disease management with over 12 years of experience.",
};

export const mockDoctorStats: DoctorStats = {
  todayAppointments: 3,
  totalPatients: 156,
  weekAppointments: 32,
  monthlyRevenue: 2400,
};

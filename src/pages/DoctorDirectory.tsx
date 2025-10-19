import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import DoctorFilters from "@/components/DoctorFilters";
import { mockDoctors } from "@/data/mockDoctors";

const DoctorDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [location, setLocation] = useState("All Locations");
  const [maxPrice, setMaxPrice] = useState(100);

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      specialty === "All Specialties" || doctor.specialty === specialty;
    const matchesLocation =
      location === "All Locations" || doctor.location === location;
    const matchesPrice = doctor.price <= maxPrice;

    return matchesSearch && matchesSpecialty && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Find Your Doctor
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse our network of verified healthcare professionals
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <DoctorFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                specialty={specialty}
                setSpecialty={setSpecialty}
                location={location}
                setLocation={setLocation}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
              />
            </aside>

            <div className="lg:col-span-3 space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              </div>
              
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No doctors found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDirectory;

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PharmacyCard from "@/components/PharmacyCard";
import PharmacyFilters from "@/components/PharmacyFilters";
import { mockPharmacies } from "@/data/mockPharmacies";
import { Badge } from "@/components/ui/badge";
import { Pill, X } from "lucide-react";

const PharmacyLocator = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get medicines from URL params
  const medicinesParam = searchParams.get("medicines");
  const prescribedMedicines = medicinesParam ? medicinesParam.split(",") : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [medication, setMedication] = useState("All Medications");
  const [open24Hours, setOpen24Hours] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);

  // Set search query from prescribed medicines on mount
  useEffect(() => {
    if (prescribedMedicines.length > 0) {
      setSearchQuery(prescribedMedicines.join(" "));
    }
  }, [medicinesParam]);

  const clearPrescribedMedicines = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  const removeMedicine = (medicine: string) => {
    const updatedMedicines = prescribedMedicines.filter(m => m !== medicine);
    if (updatedMedicines.length > 0) {
      setSearchParams({ medicines: updatedMedicines.join(",") });
    } else {
      clearPrescribedMedicines();
    }
  };

  const filteredPharmacies = mockPharmacies.filter((pharmacy) => {
    // If prescribed medicines are set, check if pharmacy has ANY of them
    let matchesPrescribedMedicines = true;
    if (prescribedMedicines.length > 0) {
      matchesPrescribedMedicines = prescribedMedicines.some(prescribedMed =>
        pharmacy.medications.some(pharmacyMed =>
          pharmacyMed.toLowerCase().includes(prescribedMed.toLowerCase()) ||
          prescribedMed.toLowerCase().includes(pharmacyMed.toLowerCase())
        )
      );
    }

    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.medications.some(med => med.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pharmacy.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation =
      location === "All Locations" || pharmacy.location === location;

    const matchesMedication =
      medication === "All Medications" ||
      pharmacy.medications.some(med => med.toLowerCase().includes(medication.toLowerCase()));

    const matches24Hours = !open24Hours || pharmacy.isOpen24Hours;

    const matchesDelivery = !deliveryAvailable || pharmacy.deliveryAvailable;

    const matchesInsurance = !acceptsInsurance || pharmacy.acceptsInsurance;

    return (
      matchesPrescribedMedicines &&
      matchesSearch &&
      matchesLocation &&
      matchesMedication &&
      matches24Hours &&
      matchesDelivery &&
      matchesInsurance
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Pharmacy Locator
            </h1>
            <p className="text-xl text-muted-foreground">
              Find pharmacies with your prescribed medications across Lebanon
            </p>
          </div>

          {/* Prescribed Medicines Section */}
          {prescribedMedicines.length > 0 && (
            <div className="mb-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    Searching for Your Prescribed Medicines
                  </h2>
                </div>
                <button
                  onClick={clearPrescribedMedicines}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {prescribedMedicines.map((medicine) => (
                  <Badge
                    key={medicine}
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-1 text-sm"
                  >
                    {medicine}
                    <button
                      onClick={() => removeMedicine(medicine)}
                      className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Showing pharmacies that have at least one of your prescribed medicines
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <PharmacyFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                location={location}
                setLocation={setLocation}
                medication={medication}
                setMedication={setMedication}
                open24Hours={open24Hours}
                setOpen24Hours={setOpen24Hours}
                deliveryAvailable={deliveryAvailable}
                setDeliveryAvailable={setDeliveryAvailable}
                acceptsInsurance={acceptsInsurance}
                setAcceptsInsurance={setAcceptsInsurance}
              />
            </aside>

            <div className="lg:col-span-3 space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Found {filteredPharmacies.length} pharmac{filteredPharmacies.length !== 1 ? 'ies' : 'y'}
              </div>

              {filteredPharmacies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No pharmacies found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                filteredPharmacies.map((pharmacy) => (
                  <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
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

export default PharmacyLocator;

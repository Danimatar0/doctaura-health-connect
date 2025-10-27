import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Pill, MapPin, ArrowRight } from "lucide-react";
import { Prescription } from "@/types";

interface PrescriptionMedicineSearchProps {
  prescriptions: Prescription[];
  trigger?: React.ReactNode;
}

const PrescriptionMedicineSearch = ({ prescriptions, trigger }: PrescriptionMedicineSearchProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);

  // Extract all unique medicines from all prescriptions
  const allMedicines = prescriptions.flatMap(prescription =>
    prescription.medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      prescriptionId: prescription.id,
      doctorName: prescription.doctorName,
      date: prescription.date,
    }))
  );

  const toggleMedicine = (medicineName: string) => {
    setSelectedMedicines(prev =>
      prev.includes(medicineName)
        ? prev.filter(m => m !== medicineName)
        : [...prev, medicineName]
    );
  };

  const selectAll = () => {
    setSelectedMedicines(allMedicines.map(m => m.name));
  };

  const deselectAll = () => {
    setSelectedMedicines([]);
  };

  const handleSearchPharmacies = () => {
    if (selectedMedicines.length === 0) return;

    // Navigate to pharmacy locator with selected medicines as query params
    const medicinesParam = selectedMedicines.join(',');
    navigate(`/pharmacies?medicines=${encodeURIComponent(medicinesParam)}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Find Pharmacies with My Medicines
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Pill className="h-6 w-6 text-primary" />
            Find Pharmacies with Your Prescribed Medicines
          </DialogTitle>
          <DialogDescription>
            Select the medicines you need and we'll show you pharmacies that have them in stock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between pb-4 border-b">
            <p className="text-sm text-muted-foreground">
              {selectedMedicines.length} of {allMedicines.length} medicine{allMedicines.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          {/* Prescriptions List */}
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No prescriptions found</p>
              <p className="text-sm text-muted-foreground">
                Your prescribed medicines will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                  {/* Prescription Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{prescription.doctorName}</p>
                      <p className="text-sm text-muted-foreground">
                        Prescribed on {new Date(prescription.date).toLocaleDateString()}
                      </p>
                    </div>
                    {prescription.diagnosis && (
                      <Badge variant="outline">{prescription.diagnosis}</Badge>
                    )}
                  </div>

                  {/* Medications List */}
                  <div className="space-y-2">
                    {prescription.medications.map((med, index) => (
                      <div
                        key={`${prescription.id}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => toggleMedicine(med.name)}
                      >
                        <Checkbox
                          checked={selectedMedicines.includes(med.name)}
                          onCheckedChange={() => toggleMedicine(med.name)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} - {med.frequency}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {med.duration}
                            </Badge>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prescription Notes */}
                  {prescription.notes && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                      <p className="text-sm">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search Button */}
          <div className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              onClick={handleSearchPharmacies}
              disabled={selectedMedicines.length === 0}
              className="w-full gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth text-lg h-14"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Find Pharmacies ({selectedMedicines.length} medicine{selectedMedicines.length !== 1 ? 's' : ''})
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            {selectedMedicines.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please select at least one medicine
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionMedicineSearch;

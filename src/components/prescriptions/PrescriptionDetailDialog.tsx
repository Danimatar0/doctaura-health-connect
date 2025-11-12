import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Pill,
  FileText,
  Clock,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { Prescription } from "@/types";

interface PrescriptionDetailDialogProps {
  prescription: Prescription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showDoctor?: boolean;
  showPatient?: boolean;
  patientName?: string;
}

const PrescriptionDetailDialog = ({
  prescription,
  open,
  onOpenChange,
  showDoctor = true,
  showPatient = false,
  patientName,
}: PrescriptionDetailDialogProps) => {
  if (!prescription) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF download functionality would be implemented here");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Pill className="h-6 w-6 text-primary" />
            Prescription Details
          </DialogTitle>
          <DialogDescription>
            Full details of the prescribed medications and instructions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {showDoctor && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Prescribed by</p>
                  <p className="font-semibold">{prescription.doctorName}</p>
                </div>
              </div>
            )}
            {showPatient && patientName && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-semibold">{patientName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date Prescribed</p>
                <p className="font-semibold">{formatDate(prescription.date)}</p>
              </div>
            </div>
            {prescription.diagnosis && (
              <div className="flex items-center gap-2 md:col-span-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                  <p className="font-semibold">{prescription.diagnosis}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Medications */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medications ({prescription.medications.length})
            </h3>
            <div className="space-y-4">
              {prescription.medications.map((med, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{med.name}</h4>
                      <Badge variant="secondary" className="mt-1">
                        Medication {index + 1}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Pill className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Dosage</p>
                        <p className="font-medium">{med.dosage}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Frequency</p>
                        <p className="font-medium">{med.frequency}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Duration</p>
                        <p className="font-medium">{med.duration}</p>
                      </div>
                    </div>

                    {med.instructions && (
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Instructions</p>
                          <p className="font-medium text-amber-900 dark:text-amber-200">
                            {med.instructions}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Additional Notes
                </h3>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    {prescription.notes}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Important Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-semibold mb-1">Important</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Follow the prescribed dosage and duration exactly as instructed</li>
                  <li>Contact your doctor if you experience any adverse effects</li>
                  <li>Do not share your medication with others</li>
                  <li>Store medications as directed on the packaging</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDetailDialog;

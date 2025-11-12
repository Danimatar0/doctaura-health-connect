import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Pill, User, FileText, Eye } from "lucide-react";
import { Prescription } from "@/types";
import { cn } from "@/lib/utils";

interface PrescriptionCardProps {
  prescription: Prescription;
  onView?: (prescription: Prescription) => void;
  showDoctor?: boolean;
  showPatient?: boolean;
  patientName?: string;
}

const PrescriptionCard = ({
  prescription,
  onView,
  showDoctor = true,
  showPatient = false,
  patientName,
}: PrescriptionCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate if prescription is recent (within 30 days)
  const isRecent = () => {
    const prescriptionDate = new Date(prescription.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prescriptionDate >= thirtyDaysAgo;
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", isRecent() && "border-l-4 border-l-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {prescription.medications.length} Medication{prescription.medications.length !== 1 ? "s" : ""}
            </CardTitle>
            {prescription.diagnosis && (
              <p className="text-sm text-muted-foreground mt-1">
                For: {prescription.diagnosis}
              </p>
            )}
          </div>
          {isRecent() && (
            <Badge variant="secondary">New</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medications List */}
        <div className="space-y-2">
          {prescription.medications.slice(0, 2).map((med, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-muted/50 rounded-md"
            >
              <Pill className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{med.name}</p>
                <p className="text-xs text-muted-foreground">
                  {med.dosage} • {med.frequency}
                  {med.duration && ` • ${med.duration}`}
                </p>
              </div>
            </div>
          ))}
          {prescription.medications.length > 2 && (
            <p className="text-xs text-muted-foreground text-center">
              +{prescription.medications.length - 2} more medication{prescription.medications.length - 2 !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Doctor/Patient Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2 border-t">
          {showDoctor && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{prescription.doctorName}</span>
            </div>
          )}
          {showPatient && patientName && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{patientName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(prescription.date)}</span>
          </div>
        </div>

        {/* Notes Preview */}
        {prescription.notes && (
          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-900 dark:text-amber-200 line-clamp-2">
              {prescription.notes}
            </p>
          </div>
        )}

        {/* View Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onView?.(prescription)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;

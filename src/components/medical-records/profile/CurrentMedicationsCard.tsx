/**
 * Current Medications Card
 *
 * Displays active medications with dosage and frequency.
 * Supports add, edit, delete operations.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pill,
  Plus,
  Pencil,
  Trash2,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import type { CurrentMedication } from '@/types/healthProfile.types';

interface CurrentMedicationsCardProps {
  medications: CurrentMedication[];
  onAdd: () => void;
  onEdit: (medication: CurrentMedication) => void;
  onDelete: (medication: CurrentMedication) => void;
  isLoading?: boolean;
}

const CurrentMedicationsCard = ({
  medications,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: CurrentMedicationsCardProps) => {
  // Filter and sort: active first, then by name
  const sortedMedications = [...medications]
    .sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });

  const activeMedications = sortedMedications.filter(m => m.isActive);
  const inactiveMedications = sortedMedications.filter(m => !m.isActive);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const MedicationItem = ({ medication }: { medication: CurrentMedication }) => (
    <div
      className={`flex items-start justify-between p-3 rounded-lg group transition-colors ${
        medication.isActive
          ? 'bg-muted/30 hover:bg-muted/50'
          : 'bg-muted/10 opacity-60 hover:opacity-80'
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            medication.isActive
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Pill className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{medication.name}</span>
            <Badge variant="secondary" className="text-xs">
              {medication.dosage}
            </Badge>
            {!medication.isActive && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Inactive
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{medication.frequency}</span>
          </div>

          {medication.purpose && (
            <p className="text-sm text-muted-foreground mt-1">
              For: {medication.purpose}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {medication.prescribedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {medication.prescribedBy}
              </span>
            )}
            {medication.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Since {formatDate(medication.startDate)}
              </span>
            )}
          </div>

          {medication.instructions && (
            <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 p-2 rounded">
              {medication.instructions}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(medication)}
          disabled={isLoading}
        >
          <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(medication)}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Current Medications
            {activeMedications.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeMedications.length} active
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            disabled={isLoading}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMedications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No medications recorded</p>
            <p className="text-xs mt-1">Add your current medications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Medications */}
            {activeMedications.map((medication) => (
              <MedicationItem key={medication.id} medication={medication} />
            ))}

            {/* Inactive Medications (if any) */}
            {inactiveMedications.length > 0 && (
              <>
                <div className="text-xs text-muted-foreground uppercase tracking-wider pt-2">
                  Inactive / Stopped
                </div>
                {inactiveMedications.map((medication) => (
                  <MedicationItem key={medication.id} medication={medication} />
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentMedicationsCard;

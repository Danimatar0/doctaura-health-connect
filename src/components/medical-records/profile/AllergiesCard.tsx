/**
 * Allergies Card
 *
 * Displays allergies with severity-coded badges.
 * Supports add, edit, delete operations.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import type { Allergy, AllergySeverity } from '@/types/healthProfile.types';
import { ALLERGY_CATEGORY_LABELS, ALLERGY_SEVERITY_LABELS } from '@/types/healthProfile.types';

interface AllergiesCardProps {
  allergies: Allergy[];
  onAdd: () => void;
  onEdit: (allergy: Allergy) => void;
  onDelete: (allergy: Allergy) => void;
  isLoading?: boolean;
}

const getSeverityStyles = (severity: AllergySeverity) => {
  switch (severity) {
    case 'severe':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'moderate':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'mild':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200';
  }
};

const getSeverityIcon = (severity: AllergySeverity) => {
  switch (severity) {
    case 'severe':
      return <ShieldAlert className="h-4 w-4" />;
    case 'moderate':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

const AllergiesCard = ({
  allergies,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: AllergiesCardProps) => {
  // Sort allergies: severe first, then moderate, then mild
  const severityOrder: Record<AllergySeverity, number> = {
    severe: 0,
    moderate: 1,
    mild: 2,
  };

  const sortedAllergies = [...allergies].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Allergies
            {allergies.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {allergies.length}
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
        {sortedAllergies.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No allergies recorded</p>
            <p className="text-xs mt-1">Add any known allergies</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAllergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-start justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{allergy.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSeverityStyles(allergy.severity)}`}
                    >
                      {getSeverityIcon(allergy.severity)}
                      <span className="ml-1">{ALLERGY_SEVERITY_LABELS[allergy.severity]}</span>
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {ALLERGY_CATEGORY_LABELS[allergy.category]}
                    </Badge>
                  </div>

                  {allergy.reactions && allergy.reactions.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Reactions: </span>
                      <span className="text-sm">{allergy.reactions.join(', ')}</span>
                    </div>
                  )}

                  {allergy.notes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {allergy.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(allergy)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(allergy)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Severity Legend */}
        {sortedAllergies.length > 0 && (
          <div className="mt-4 pt-3 border-t flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Severe
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Mild
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllergiesCard;

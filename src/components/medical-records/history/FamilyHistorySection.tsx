/**
 * Family History Section Component
 *
 * Displays family medical history organized by relationship.
 * Supports add, edit, delete operations.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  User,
  Heart,
} from 'lucide-react';
import type { FamilyMedicalHistory, FamilyRelationship } from '@/types/healthProfile.types';
import { FAMILY_RELATIONSHIP_LABELS } from '@/types/healthProfile.types';

interface FamilyHistorySectionProps {
  history: FamilyMedicalHistory[];
  onAdd: () => void;
  onEdit: (entry: FamilyMedicalHistory) => void;
  onDelete: (entry: FamilyMedicalHistory) => void;
  isLoading?: boolean;
}

const getRelationshipColor = (relationship: FamilyRelationship): string => {
  switch (relationship) {
    case 'mother':
    case 'father':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'sibling':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'grandparent':
      return 'bg-purple-500/10 text-purple-600 border-purple-200';
    case 'aunt':
    case 'uncle':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'child':
      return 'bg-pink-500/10 text-pink-600 border-pink-200';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200';
  }
};

const relationshipOrder: Record<FamilyRelationship, number> = {
  mother: 0,
  father: 1,
  sibling: 2,
  grandparent: 3,
  aunt: 4,
  uncle: 5,
  child: 6,
  other: 7,
};

const FamilyHistorySection = ({
  history,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: FamilyHistorySectionProps) => {
  // Group by relationship
  const groupedHistory = useMemo(() => {
    const groups: Record<string, FamilyMedicalHistory[]> = {};

    history.forEach((entry) => {
      const key = entry.relationshipDetails || FAMILY_RELATIONSHIP_LABELS[entry.relationship];
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });

    // Sort groups by relationship order
    return Object.entries(groups).sort(([, a], [, b]) => {
      const orderA = relationshipOrder[a[0].relationship];
      const orderB = relationshipOrder[b[0].relationship];
      return orderA - orderB;
    });
  }, [history]);

  // Get unique conditions for summary
  const uniqueConditions = useMemo(() => {
    const conditions = new Set<string>();
    history.forEach((entry) => conditions.add(entry.condition.toLowerCase()));
    return Array.from(conditions);
  }, [history]);

  // Count conditions that appear multiple times (hereditary risk)
  const inheritedConditions = useMemo(() => {
    const conditionCount: Record<string, number> = {};
    history.forEach((entry) => {
      const condition = entry.condition.toLowerCase();
      conditionCount[condition] = (conditionCount[condition] || 0) + 1;
    });
    return Object.entries(conditionCount)
      .filter(([, count]) => count >= 2)
      .map(([condition]) => condition);
  }, [history]);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Family Medical History
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {history.length} entries
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

        {/* Inherited conditions alert */}
        {inheritedConditions.length > 0 && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Potential Hereditary Conditions
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Multiple family members have:{' '}
                  {inheritedConditions.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No family medical history recorded</p>
            <p className="text-xs mt-1">Add health conditions of family members</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedHistory.map(([relationshipLabel, entries]) => (
              <div key={relationshipLabel}>
                {/* Relationship Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="font-medium">{relationshipLabel}</span>
                    {entries[0].isDeceased && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Deceased
                        {entries[0].ageAtDeath && ` (age ${entries[0].ageAtDeath})`}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Conditions List */}
                <div className="ml-10 space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{entry.condition}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getRelationshipColor(entry.relationship)}`}
                          >
                            {FAMILY_RELATIONSHIP_LABELS[entry.relationship]}
                          </Badge>
                          {entry.ageAtDiagnosis && (
                            <span className="text-xs text-muted-foreground">
                              Diagnosed at age {entry.ageAtDiagnosis}
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            {entry.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(entry)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete(entry)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary of all conditions */}
            {uniqueConditions.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Family Conditions Summary
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueConditions.map((condition) => (
                    <Badge key={condition} variant="secondary" className="text-xs">
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyHistorySection;

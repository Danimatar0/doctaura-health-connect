/**
 * Chronic Conditions Card
 *
 * Displays chronic conditions with management status indicators.
 * Supports add, edit, delete operations.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react';
import type { ChronicCondition, ManagementStatus } from '@/types/healthProfile.types';
import { MANAGEMENT_STATUS_LABELS } from '@/types/healthProfile.types';

interface ChronicConditionsCardProps {
  conditions: ChronicCondition[];
  onAdd: () => void;
  onEdit: (condition: ChronicCondition) => void;
  onDelete: (condition: ChronicCondition) => void;
  isLoading?: boolean;
}

const getStatusStyles = (status: ManagementStatus) => {
  switch (status) {
    case 'well-controlled':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'partially-controlled':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'uncontrolled':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'in-remission':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200';
  }
};

const getStatusIcon = (status: ManagementStatus) => {
  switch (status) {
    case 'well-controlled':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'partially-controlled':
      return <AlertCircle className="h-3.5 w-3.5" />;
    case 'uncontrolled':
      return <XCircle className="h-3.5 w-3.5" />;
    case 'in-remission':
      return <Clock className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const ChronicConditionsCard = ({
  conditions,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: ChronicConditionsCardProps) => {
  // Sort: uncontrolled first, then partially-controlled, then well-controlled, then in-remission
  const statusOrder: Record<ManagementStatus, number> = {
    'uncontrolled': 0,
    'partially-controlled': 1,
    'well-controlled': 2,
    'in-remission': 3,
  };

  const sortedConditions = [...conditions].sort(
    (a, b) => statusOrder[a.managementStatus] - statusOrder[b.managementStatus]
  );

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Chronic Conditions
            {conditions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {conditions.length}
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
        {sortedConditions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chronic conditions recorded</p>
            <p className="text-xs mt-1">Add any ongoing health conditions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedConditions.map((condition) => (
              <div
                key={condition.id}
                className="flex items-start justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{condition.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusStyles(condition.managementStatus)}`}
                    >
                      {getStatusIcon(condition.managementStatus)}
                      <span className="ml-1">
                        {MANAGEMENT_STATUS_LABELS[condition.managementStatus]}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {condition.diagnosedDate && (
                      <span>Diagnosed: {formatDate(condition.diagnosedDate)}</span>
                    )}
                    {condition.managedBy && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {condition.managedBy}
                      </span>
                    )}
                  </div>

                  {condition.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {condition.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(condition)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(condition)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Legend */}
        {sortedConditions.length > 0 && (
          <div className="mt-4 pt-3 border-t flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Well Controlled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Partially
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Uncontrolled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              In Remission
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChronicConditionsCard;

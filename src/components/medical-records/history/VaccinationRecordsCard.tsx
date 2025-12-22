/**
 * Vaccination Records Card Component
 *
 * Displays vaccination history with due date reminders.
 * Color-coded status badges for upcoming, due soon, and overdue vaccines.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Syringe,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import type { VaccinationRecord, VaccinationStatus } from '@/types/healthProfile.types';
import { getVaccinationStatus } from '@/types/healthProfile.types';

interface VaccinationRecordsCardProps {
  records: VaccinationRecord[];
  onAdd: () => void;
  onEdit: (record: VaccinationRecord) => void;
  onDelete: (record: VaccinationRecord) => void;
  isLoading?: boolean;
}

const getStatusConfig = (status: VaccinationStatus) => {
  switch (status) {
    case 'overdue':
      return {
        label: 'Overdue',
        color: 'bg-red-500/10 text-red-600 border-red-200',
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    case 'due-soon':
      return {
        label: 'Due Soon',
        color: 'bg-orange-500/10 text-orange-600 border-orange-200',
        icon: <Clock className="h-3 w-3" />,
      };
    case 'upcoming':
      return {
        label: 'Upcoming',
        color: 'bg-blue-500/10 text-blue-600 border-blue-200',
        icon: <Calendar className="h-3 w-3" />,
      };
    case 'completed':
    default:
      return {
        label: 'Completed',
        color: 'bg-green-500/10 text-green-600 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />,
      };
  }
};

const VaccinationRecordsCard = ({
  records,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: VaccinationRecordsCardProps) => {
  // Sort records: overdue first, then due soon, then by date
  const sortedRecords = useMemo(() => {
    return [...records]
      .map((record) => ({
        ...record,
        status: getVaccinationStatus(record.nextDueDate),
      }))
      .sort((a, b) => {
        const statusOrder: Record<VaccinationStatus, number> = {
          overdue: 0,
          'due-soon': 1,
          upcoming: 2,
          completed: 3,
        };
        const orderDiff = statusOrder[a.status] - statusOrder[b.status];
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime();
      });
  }, [records]);

  // Get alerts count
  const alertsCount = useMemo(() => {
    return sortedRecords.filter(
      (r) => r.status === 'overdue' || r.status === 'due-soon'
    ).length;
  }, [sortedRecords]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dateStr: string): number => {
    const dueDate = new Date(dateStr);
    const today = new Date();
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Syringe className="h-5 w-5 text-primary" />
            Vaccination Records
            {records.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {records.length}
              </Badge>
            )}
            {alertsCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {alertsCount} action{alertsCount > 1 ? 's' : ''} needed
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
        {sortedRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Syringe className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No vaccination records</p>
            <p className="text-xs mt-1">Add your vaccination history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Alert Section for overdue/due soon */}
            {alertsCount > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-200 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {alertsCount} vaccine{alertsCount > 1 ? 's' : ''} need attention
                  </span>
                </div>
              </div>
            )}

            {/* Vaccination List */}
            {sortedRecords.map((record) => {
              const statusConfig = getStatusConfig(record.status);
              const daysUntilDue = record.nextDueDate
                ? getDaysUntilDue(record.nextDueDate)
                : null;

              return (
                <div
                  key={record.id}
                  className={`flex items-start justify-between p-4 rounded-lg group transition-colors ${
                    record.status === 'overdue'
                      ? 'bg-red-500/5 border border-red-200'
                      : record.status === 'due-soon'
                      ? 'bg-orange-500/5 border border-orange-200'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        record.status === 'overdue'
                          ? 'bg-red-500/10'
                          : record.status === 'due-soon'
                          ? 'bg-orange-500/10'
                          : 'bg-primary/10'
                      }`}
                    >
                      <Syringe
                        className={`h-5 w-5 ${
                          record.status === 'overdue'
                            ? 'text-red-600'
                            : record.status === 'due-soon'
                            ? 'text-orange-600'
                            : 'text-primary'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{record.vaccineName}</span>
                        <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                        {record.doseNumber && record.totalDoses && (
                          <Badge variant="secondary" className="text-xs">
                            Dose {record.doseNumber}/{record.totalDoses}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Given: {formatDate(record.dateAdministered)}</span>
                        </div>
                        {record.nextDueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Next: {formatDate(record.nextDueDate)}
                              {daysUntilDue !== null && (
                                <span
                                  className={`ml-1 ${
                                    daysUntilDue < 0
                                      ? 'text-red-600 font-medium'
                                      : daysUntilDue <= 30
                                      ? 'text-orange-600 font-medium'
                                      : ''
                                  }`}
                                >
                                  ({daysUntilDue < 0
                                    ? `${Math.abs(daysUntilDue)} days overdue`
                                    : `in ${daysUntilDue} days`})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {(record.facility || record.administeredBy || record.manufacturer) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {record.facility && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {record.facility}
                            </span>
                          )}
                          {record.administeredBy && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {record.administeredBy}
                            </span>
                          )}
                          {record.manufacturer && (
                            <span>Manufacturer: {record.manufacturer}</span>
                          )}
                        </div>
                      )}

                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(record)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDelete(record)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {sortedRecords.length > 0 && (
          <div className="mt-4 pt-3 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Upcoming
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Due Soon (30 days)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Overdue
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VaccinationRecordsCard;

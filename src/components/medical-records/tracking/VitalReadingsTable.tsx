/**
 * Vital Readings Table Component
 *
 * Displays vital signs in a tabular format with edit/delete actions.
 * Supports filtering by vital type and date range.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, List, Scale, Heart, Droplets } from 'lucide-react';
import type {
  HeightWeightReading,
  BloodPressureReading,
  BloodSugarReading,
} from '@/types/healthProfile.types';
import {
  getBloodPressureCategory,
  getBloodSugarCategory,
  BLOOD_SUGAR_MEASUREMENT_LABELS,
} from '@/types/healthProfile.types';

type VitalType = 'all' | 'height-weight' | 'blood-pressure' | 'blood-sugar';

interface VitalReadingsTableProps {
  heightWeightData: HeightWeightReading[];
  bloodPressureData: BloodPressureReading[];
  bloodSugarData: BloodSugarReading[];
  onEditHeightWeight: (reading: HeightWeightReading) => void;
  onEditBloodPressure: (reading: BloodPressureReading) => void;
  onEditBloodSugar: (reading: BloodSugarReading) => void;
  onDeleteHeightWeight: (reading: HeightWeightReading) => void;
  onDeleteBloodPressure: (reading: BloodPressureReading) => void;
  onDeleteBloodSugar: (reading: BloodSugarReading) => void;
  isLoading?: boolean;
}

// Union type for all readings
type AnyReading = (HeightWeightReading & { type: 'height-weight' }) |
  (BloodPressureReading & { type: 'blood-pressure' }) |
  (BloodSugarReading & { type: 'blood-sugar' });

const VitalReadingsTable = ({
  heightWeightData,
  bloodPressureData,
  bloodSugarData,
  onEditHeightWeight,
  onEditBloodPressure,
  onEditBloodSugar,
  onDeleteHeightWeight,
  onDeleteBloodPressure,
  onDeleteBloodSugar,
  isLoading = false,
}: VitalReadingsTableProps) => {
  const [vitalType, setVitalType] = useState<VitalType>('all');

  // Combine and sort all readings
  const allReadings: AnyReading[] = [
    ...heightWeightData.map(r => ({ ...r, type: 'height-weight' as const })),
    ...bloodPressureData.map(r => ({ ...r, type: 'blood-pressure' as const })),
    ...bloodSugarData.map(r => ({ ...r, type: 'blood-sugar' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter by type
  const filteredReadings = vitalType === 'all'
    ? allReadings
    : allReadings.filter(r => r.type === vitalType);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: VitalType) => {
    switch (type) {
      case 'height-weight':
        return <Scale className="h-4 w-4 text-primary" />;
      case 'blood-pressure':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'blood-sugar':
        return <Droplets className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: VitalType) => {
    switch (type) {
      case 'height-weight':
        return 'Weight/BMI';
      case 'blood-pressure':
        return 'Blood Pressure';
      case 'blood-sugar':
        return 'Blood Sugar';
      default:
        return '';
    }
  };

  const renderValue = (reading: AnyReading) => {
    switch (reading.type) {
      case 'height-weight':
        return (
          <div>
            {reading.weight && <span className="font-medium">{reading.weight} kg</span>}
            {reading.bmi && (
              <Badge variant="secondary" className="ml-2 text-xs">
                BMI: {reading.bmi.toFixed(1)}
              </Badge>
            )}
          </div>
        );
      case 'blood-pressure':
        const bpCategory = getBloodPressureCategory(reading.systolic, reading.diastolic);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {reading.systolic}/{reading.diastolic}
            </span>
            <span className="text-muted-foreground text-sm">mmHg</span>
            {reading.pulse && (
              <Badge variant="secondary" className="text-xs">
                {reading.pulse} bpm
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-xs ${
                bpCategory === 'normal' ? 'bg-green-500/10 text-green-600' :
                bpCategory === 'elevated' ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-red-500/10 text-red-600'
              }`}
            >
              {bpCategory.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Badge>
          </div>
        );
      case 'blood-sugar':
        const bsCategory = getBloodSugarCategory(reading.value, reading.measurementType, reading.unit);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{reading.value}</span>
            <span className="text-muted-foreground text-sm">{reading.unit}</span>
            <Badge variant="secondary" className="text-xs">
              {BLOOD_SUGAR_MEASUREMENT_LABELS[reading.measurementType]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                bsCategory === 'normal' ? 'bg-green-500/10 text-green-600' :
                bsCategory === 'prediabetic' ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-red-500/10 text-red-600'
              }`}
            >
              {bsCategory.charAt(0).toUpperCase() + bsCategory.slice(1)}
            </Badge>
          </div>
        );
      default:
        return null;
    }
  };

  const handleEdit = (reading: AnyReading) => {
    switch (reading.type) {
      case 'height-weight':
        onEditHeightWeight(reading);
        break;
      case 'blood-pressure':
        onEditBloodPressure(reading);
        break;
      case 'blood-sugar':
        onEditBloodSugar(reading);
        break;
    }
  };

  const handleDelete = (reading: AnyReading) => {
    switch (reading.type) {
      case 'height-weight':
        onDeleteHeightWeight(reading);
        break;
      case 'blood-pressure':
        onDeleteBloodPressure(reading);
        break;
      case 'blood-sugar':
        onDeleteBloodSugar(reading);
        break;
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Readings History
            <Badge variant="secondary" className="ml-1">
              {filteredReadings.length}
            </Badge>
          </CardTitle>
          <Select value={vitalType} onValueChange={(v) => setVitalType(v as VitalType)}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vitals</SelectItem>
              <SelectItem value="height-weight">Weight/BMI</SelectItem>
              <SelectItem value="blood-pressure">Blood Pressure</SelectItem>
              <SelectItem value="blood-sugar">Blood Sugar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReadings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <List className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No readings recorded</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[150px]">Notes</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReadings.slice(0, 20).map((reading) => (
                  <TableRow key={`${reading.type}-${reading.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(reading.type)}
                        <span className="text-xs text-muted-foreground">
                          {getTypeLabel(reading.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(reading.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(reading.recordedAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderValue(reading)}</TableCell>
                    <TableCell>
                      {reading.notes && (
                        <span className="text-sm text-muted-foreground truncate block max-w-[150px]">
                          {reading.notes}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(reading)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(reading)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredReadings.length > 20 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 20 of {filteredReadings.length} readings
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VitalReadingsTable;

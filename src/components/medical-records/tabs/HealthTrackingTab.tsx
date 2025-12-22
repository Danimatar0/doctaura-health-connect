/**
 * Health Tracking Tab Component
 *
 * Displays vital sign charts and readings history.
 * Includes height/weight, blood pressure, and blood sugar tracking.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  HeightWeightChart,
  BloodPressureChart,
  BloodSugarChart,
  VitalReadingsTable,
} from '../tracking';
import { AddVitalReadingDialog, DeleteConfirmationDialog } from '../dialogs';
import { useFeatureFlags } from '@/services/featureFlagsService';
import type {
  HeightWeightReading,
  BloodPressureReading,
  BloodSugarReading,
} from '@/types/healthProfile.types';
import type {
  HeightWeightFormData,
  BloodPressureFormData,
  BloodSugarFormData,
} from '@/schemas/healthProfile.schemas';

interface HealthTrackingTabProps {
  heightWeightData: HeightWeightReading[];
  bloodPressureData: BloodPressureReading[];
  bloodSugarData: BloodSugarReading[];
  onAddHeightWeight: (data: HeightWeightFormData) => void;
  onEditHeightWeight: (id: string, data: HeightWeightFormData) => void;
  onDeleteHeightWeight: (id: string) => void;
  onAddBloodPressure: (data: BloodPressureFormData) => void;
  onEditBloodPressure: (id: string, data: BloodPressureFormData) => void;
  onDeleteBloodPressure: (id: string) => void;
  onAddBloodSugar: (data: BloodSugarFormData) => void;
  onEditBloodSugar: (id: string, data: BloodSugarFormData) => void;
  onDeleteBloodSugar: (id: string) => void;
  isLoading?: boolean;
}

type VitalType = 'height-weight' | 'blood-pressure' | 'blood-sugar';

type DeleteTarget = {
  type: VitalType;
  id: string;
  name: string;
};

const HealthTrackingTab = ({
  heightWeightData,
  bloodPressureData,
  bloodSugarData,
  onAddHeightWeight,
  onEditHeightWeight,
  onDeleteHeightWeight,
  onAddBloodPressure,
  onEditBloodPressure,
  onDeleteBloodPressure,
  onAddBloodSugar,
  onEditBloodSugar,
  onDeleteBloodSugar,
  isLoading = false,
}: HealthTrackingTabProps) => {
  const { flags } = useFeatureFlags();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [defaultVitalType, setDefaultVitalType] = useState<VitalType>('height-weight');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Open add dialog with specific type
  const handleOpenAddDialog = (type: VitalType = 'height-weight') => {
    setDefaultVitalType(type);
    setAddDialogOpen(true);
  };

  // Handle height/weight submit
  const handleHeightWeightSubmit = (data: HeightWeightFormData) => {
    onAddHeightWeight(data);
  };

  // Handle blood pressure submit
  const handleBloodPressureSubmit = (data: BloodPressureFormData) => {
    onAddBloodPressure(data);
  };

  // Handle blood sugar submit
  const handleBloodSugarSubmit = (data: BloodSugarFormData) => {
    onAddBloodSugar(data);
  };

  // Edit handlers
  const handleEditHeightWeight = (reading: HeightWeightReading) => {
    // For now, open the add dialog - in a more complete implementation,
    // you'd have a separate edit dialog or mode
    handleOpenAddDialog('height-weight');
  };

  const handleEditBloodPressure = (reading: BloodPressureReading) => {
    handleOpenAddDialog('blood-pressure');
  };

  const handleEditBloodSugar = (reading: BloodSugarReading) => {
    handleOpenAddDialog('blood-sugar');
  };

  // Delete handlers
  const handleDeleteHeightWeight = (reading: HeightWeightReading) => {
    setDeleteTarget({
      type: 'height-weight',
      id: reading.id,
      name: `Weight reading from ${new Date(reading.date).toLocaleDateString()}`,
    });
  };

  const handleDeleteBloodPressure = (reading: BloodPressureReading) => {
    setDeleteTarget({
      type: 'blood-pressure',
      id: reading.id,
      name: `Blood pressure reading from ${new Date(reading.date).toLocaleDateString()}`,
    });
  };

  const handleDeleteBloodSugar = (reading: BloodSugarReading) => {
    setDeleteTarget({
      type: 'blood-sugar',
      id: reading.id,
      name: `Blood sugar reading from ${new Date(reading.date).toLocaleDateString()}`,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case 'height-weight':
        onDeleteHeightWeight(deleteTarget.id);
        break;
      case 'blood-pressure':
        onDeleteBloodPressure(deleteTarget.id);
        break;
      case 'blood-sugar':
        onDeleteBloodSugar(deleteTarget.id);
        break;
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Health Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Track and monitor your vital signs over time
          </p>
        </div>
        <Button onClick={() => handleOpenAddDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reading
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Height/Weight Chart */}
        {flags.heightWeightTracking && (
          <HeightWeightChart
            data={heightWeightData}
            onAddNew={() => handleOpenAddDialog('height-weight')}
          />
        )}

        {/* Blood Pressure Chart */}
        {flags.bloodPressureTracking && (
          <BloodPressureChart
            data={bloodPressureData}
            onAddNew={() => handleOpenAddDialog('blood-pressure')}
          />
        )}

        {/* Blood Sugar Chart - Full Width if alone */}
        {flags.bloodSugarTracking && (
          <div className={!flags.heightWeightTracking && !flags.bloodPressureTracking ? 'lg:col-span-2' : ''}>
            <BloodSugarChart
              data={bloodSugarData}
              onAddNew={() => handleOpenAddDialog('blood-sugar')}
            />
          </div>
        )}
      </div>

      {/* Readings Table */}
      <VitalReadingsTable
        heightWeightData={heightWeightData}
        bloodPressureData={bloodPressureData}
        bloodSugarData={bloodSugarData}
        onEditHeightWeight={handleEditHeightWeight}
        onEditBloodPressure={handleEditBloodPressure}
        onEditBloodSugar={handleEditBloodSugar}
        onDeleteHeightWeight={handleDeleteHeightWeight}
        onDeleteBloodPressure={handleDeleteBloodPressure}
        onDeleteBloodSugar={handleDeleteBloodSugar}
        isLoading={isLoading}
      />

      {/* Add Vital Reading Dialog */}
      <AddVitalReadingDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmitHeightWeight={handleHeightWeightSubmit}
        onSubmitBloodPressure={handleBloodPressureSubmit}
        onSubmitBloodSugar={handleBloodSugarSubmit}
        defaultType={defaultVitalType}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Reading?"
        itemName={deleteTarget?.name}
        description="This action cannot be undone. This will permanently remove this vital sign reading from your health profile."
        isLoading={isLoading}
      />
    </div>
  );
};

export default HealthTrackingTab;

/**
 * History Tab Component
 *
 * Displays medical history timeline, family history, and vaccination records.
 * Includes add/edit/delete functionality for all sections.
 */

import { useState } from 'react';
import {
  MedicalHistoryTimeline,
  FamilyHistorySection,
  VaccinationRecordsCard,
} from '../history';
import {
  AddPastEventDialog,
  AddFamilyHistoryDialog,
  AddVaccinationDialog,
  DeleteConfirmationDialog,
} from '../dialogs';
import { useFeatureFlags } from '@/services/featureFlagsService';
import type {
  PastMedicalEvent,
  FamilyMedicalHistory,
  VaccinationRecord,
} from '@/types/healthProfile.types';
import type {
  PastMedicalEventFormData,
  FamilyMedicalHistoryFormData,
  VaccinationRecordFormData,
} from '@/schemas/healthProfile.schemas';

interface HistoryTabProps {
  medicalHistory: PastMedicalEvent[];
  familyHistory: FamilyMedicalHistory[];
  vaccinations: VaccinationRecord[];
  onAddMedicalEvent: (data: PastMedicalEventFormData) => void;
  onEditMedicalEvent: (id: string, data: PastMedicalEventFormData) => void;
  onDeleteMedicalEvent: (id: string) => void;
  onAddFamilyHistory: (data: FamilyMedicalHistoryFormData) => void;
  onEditFamilyHistory: (id: string, data: FamilyMedicalHistoryFormData) => void;
  onDeleteFamilyHistory: (id: string) => void;
  onAddVaccination: (data: VaccinationRecordFormData) => void;
  onEditVaccination: (id: string, data: VaccinationRecordFormData) => void;
  onDeleteVaccination: (id: string) => void;
  isLoading?: boolean;
}

type DeleteTarget = {
  type: 'event' | 'family' | 'vaccination';
  id: string;
  name: string;
};

const HistoryTab = ({
  medicalHistory,
  familyHistory,
  vaccinations,
  onAddMedicalEvent,
  onEditMedicalEvent,
  onDeleteMedicalEvent,
  onAddFamilyHistory,
  onEditFamilyHistory,
  onDeleteFamilyHistory,
  onAddVaccination,
  onEditVaccination,
  onDeleteVaccination,
  isLoading = false,
}: HistoryTabProps) => {
  const { flags } = useFeatureFlags();

  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<PastMedicalEvent | null>(null);

  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [editFamily, setEditFamily] = useState<FamilyMedicalHistory | null>(null);

  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false);
  const [editVaccination, setEditVaccination] = useState<VaccinationRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Medical Event handlers
  const handleAddEvent = () => {
    setEditEvent(null);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: PastMedicalEvent) => {
    setEditEvent(event);
    setEventDialogOpen(true);
  };

  const handleEventSubmit = (data: PastMedicalEventFormData) => {
    if (editEvent) {
      onEditMedicalEvent(editEvent.id, data);
    } else {
      onAddMedicalEvent(data);
    }
    setEventDialogOpen(false);
    setEditEvent(null);
  };

  // Family History handlers
  const handleAddFamily = () => {
    setEditFamily(null);
    setFamilyDialogOpen(true);
  };

  const handleEditFamily = (entry: FamilyMedicalHistory) => {
    setEditFamily(entry);
    setFamilyDialogOpen(true);
  };

  const handleFamilySubmit = (data: FamilyMedicalHistoryFormData) => {
    if (editFamily) {
      onEditFamilyHistory(editFamily.id, data);
    } else {
      onAddFamilyHistory(data);
    }
    setFamilyDialogOpen(false);
    setEditFamily(null);
  };

  // Vaccination handlers
  const handleAddVaccination = () => {
    setEditVaccination(null);
    setVaccinationDialogOpen(true);
  };

  const handleEditVaccination = (vaccination: VaccinationRecord) => {
    setEditVaccination(vaccination);
    setVaccinationDialogOpen(true);
  };

  const handleVaccinationSubmit = (data: VaccinationRecordFormData) => {
    if (editVaccination) {
      onEditVaccination(editVaccination.id, data);
    } else {
      onAddVaccination(data);
    }
    setVaccinationDialogOpen(false);
    setEditVaccination(null);
  };

  // Delete handlers
  const handleDelete = (target: DeleteTarget) => {
    setDeleteTarget(target);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case 'event':
        onDeleteMedicalEvent(deleteTarget.id);
        break;
      case 'family':
        onDeleteFamilyHistory(deleteTarget.id);
        break;
      case 'vaccination':
        onDeleteVaccination(deleteTarget.id);
        break;
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Medical History Timeline */}
      {flags.medicalHistorySection && (
        <MedicalHistoryTimeline
          events={medicalHistory}
          onAdd={handleAddEvent}
          onEdit={handleEditEvent}
          onDelete={(event) =>
            handleDelete({ type: 'event', id: event.id, name: event.title })
          }
          isLoading={isLoading}
        />
      )}

      {/* Two Column Layout for Family History and Vaccinations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Family History */}
        {flags.familyHistorySection && (
          <FamilyHistorySection
            history={familyHistory}
            onAdd={handleAddFamily}
            onEdit={handleEditFamily}
            onDelete={(entry) =>
              handleDelete({
                type: 'family',
                id: entry.id,
                name: `${entry.relationship} - ${entry.condition}`,
              })
            }
            isLoading={isLoading}
          />
        )}

        {/* Vaccination Records */}
        {flags.vaccinationRecords && (
          <VaccinationRecordsCard
            records={vaccinations}
            onAdd={handleAddVaccination}
            onEdit={handleEditVaccination}
            onDelete={(record) =>
              handleDelete({
                type: 'vaccination',
                id: record.id,
                name: record.vaccineName,
              })
            }
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Dialogs */}
      <AddPastEventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        onSubmit={handleEventSubmit}
        editData={editEvent}
        isLoading={isLoading}
      />

      <AddFamilyHistoryDialog
        open={familyDialogOpen}
        onOpenChange={setFamilyDialogOpen}
        onSubmit={handleFamilySubmit}
        editData={editFamily}
        isLoading={isLoading}
      />

      <AddVaccinationDialog
        open={vaccinationDialogOpen}
        onOpenChange={setVaccinationDialogOpen}
        onSubmit={handleVaccinationSubmit}
        editData={editVaccination}
        isLoading={isLoading}
      />

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${
          deleteTarget?.type === 'event'
            ? 'Medical Event'
            : deleteTarget?.type === 'family'
              ? 'Family History Entry'
              : 'Vaccination Record'
        }?`}
        itemName={deleteTarget?.name}
        description="This action cannot be undone. This will permanently remove this item from your health history."
        isLoading={isLoading}
      />
    </div>
  );
};

export default HistoryTab;

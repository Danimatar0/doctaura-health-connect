/**
 * Overview Tab Component
 *
 * Displays the patient's health profile summary including
 * personal info, emergency contacts, allergies, conditions, and medications.
 */

import { useState } from 'react';
import {
  PersonalInfoCard,
  EmergencyContactsCard,
  AllergiesCard,
  ChronicConditionsCard,
  CurrentMedicationsCard,
} from '../profile';
import {
  AddEmergencyContactDialog,
  AddAllergyDialog,
  AddChronicConditionDialog,
  AddMedicationDialog,
  DeleteConfirmationDialog,
} from '../dialogs';
import { ExportToPdfButton, ShareRecordsButton } from '../actions';
import { useFeatureFlags } from '@/services/featureFlagsService';
import type {
  EmergencyContact,
  Allergy,
  ChronicCondition,
  CurrentMedication,
  HeightWeightReading,
  BloodPressureReading,
  BloodSugarReading,
  PastMedicalEvent,
  FamilyMedicalHistory,
  VaccinationRecord,
} from '@/types/healthProfile.types';
import type {
  EmergencyContactFormData,
  AllergyFormData,
  ChronicConditionFormData,
  CurrentMedicationFormData,
} from '@/schemas/healthProfile.schemas';

interface PatientInfo {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bloodType?: string;
  email?: string;
  phone?: string;
}

interface OverviewTabProps {
  patientInfo?: PatientInfo;
  emergencyContacts: EmergencyContact[];
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  medications: CurrentMedication[];
  // For PDF export
  heightWeightData?: HeightWeightReading[];
  bloodPressureData?: BloodPressureReading[];
  bloodSugarData?: BloodSugarReading[];
  medicalHistory?: PastMedicalEvent[];
  familyHistory?: FamilyMedicalHistory[];
  vaccinations?: VaccinationRecord[];
  // Handlers
  onAddEmergencyContact: (data: EmergencyContactFormData) => void;
  onEditEmergencyContact: (id: string, data: EmergencyContactFormData) => void;
  onDeleteEmergencyContact: (id: string) => void;
  onAddAllergy: (data: AllergyFormData) => void;
  onEditAllergy: (id: string, data: AllergyFormData) => void;
  onDeleteAllergy: (id: string) => void;
  onAddCondition: (data: ChronicConditionFormData) => void;
  onEditCondition: (id: string, data: ChronicConditionFormData) => void;
  onDeleteCondition: (id: string) => void;
  onAddMedication: (data: CurrentMedicationFormData) => void;
  onEditMedication: (id: string, data: CurrentMedicationFormData) => void;
  onDeleteMedication: (id: string) => void;
  isLoading?: boolean;
}

type DeleteTarget = {
  type: 'contact' | 'allergy' | 'condition' | 'medication';
  id: string;
  name: string;
};

const OverviewTab = ({
  patientInfo,
  emergencyContacts,
  allergies,
  chronicConditions,
  medications,
  heightWeightData,
  bloodPressureData,
  bloodSugarData,
  medicalHistory,
  familyHistory,
  vaccinations,
  onAddEmergencyContact,
  onEditEmergencyContact,
  onDeleteEmergencyContact,
  onAddAllergy,
  onEditAllergy,
  onDeleteAllergy,
  onAddCondition,
  onEditCondition,
  onDeleteCondition,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
  isLoading = false,
}: OverviewTabProps) => {
  const { flags } = useFeatureFlags();

  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);

  const [allergyDialogOpen, setAllergyDialogOpen] = useState(false);
  const [editAllergy, setEditAllergy] = useState<Allergy | null>(null);

  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [editCondition, setEditCondition] = useState<ChronicCondition | null>(null);

  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [editMedication, setEditMedication] = useState<CurrentMedication | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Contact handlers
  const handleAddContact = () => {
    setEditContact(null);
    setContactDialogOpen(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditContact(contact);
    setContactDialogOpen(true);
  };

  const handleContactSubmit = (data: EmergencyContactFormData) => {
    if (editContact) {
      onEditEmergencyContact(editContact.id, data);
    } else {
      onAddEmergencyContact(data);
    }
    setContactDialogOpen(false);
    setEditContact(null);
  };

  // Allergy handlers
  const handleAddAllergy = () => {
    setEditAllergy(null);
    setAllergyDialogOpen(true);
  };

  const handleEditAllergy = (allergy: Allergy) => {
    setEditAllergy(allergy);
    setAllergyDialogOpen(true);
  };

  const handleAllergySubmit = (data: AllergyFormData) => {
    if (editAllergy) {
      onEditAllergy(editAllergy.id, data);
    } else {
      onAddAllergy(data);
    }
    setAllergyDialogOpen(false);
    setEditAllergy(null);
  };

  // Condition handlers
  const handleAddCondition = () => {
    setEditCondition(null);
    setConditionDialogOpen(true);
  };

  const handleEditCondition = (condition: ChronicCondition) => {
    setEditCondition(condition);
    setConditionDialogOpen(true);
  };

  const handleConditionSubmit = (data: ChronicConditionFormData) => {
    if (editCondition) {
      onEditCondition(editCondition.id, data);
    } else {
      onAddCondition(data);
    }
    setConditionDialogOpen(false);
    setEditCondition(null);
  };

  // Medication handlers
  const handleAddMedication = () => {
    setEditMedication(null);
    setMedicationDialogOpen(true);
  };

  const handleEditMedication = (medication: CurrentMedication) => {
    setEditMedication(medication);
    setMedicationDialogOpen(true);
  };

  const handleMedicationSubmit = (data: CurrentMedicationFormData) => {
    if (editMedication) {
      onEditMedication(editMedication.id, data);
    } else {
      onAddMedication(data);
    }
    setMedicationDialogOpen(false);
    setEditMedication(null);
  };

  // Delete handlers
  const handleDelete = (target: DeleteTarget) => {
    setDeleteTarget(target);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case 'contact':
        onDeleteEmergencyContact(deleteTarget.id);
        break;
      case 'allergy':
        onDeleteAllergy(deleteTarget.id);
        break;
      case 'condition':
        onDeleteCondition(deleteTarget.id);
        break;
      case 'medication':
        onDeleteMedication(deleteTarget.id);
        break;
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2">
        {flags.recordsExportPdf && (
          <ExportToPdfButton
            data={{
              patientInfo,
              emergencyContacts,
              allergies,
              chronicConditions,
              medications,
              heightWeightData,
              bloodPressureData,
              bloodSugarData,
              medicalHistory,
              familyHistory,
              vaccinations,
            }}
          />
        )}
        {flags.recordsSharing && <ShareRecordsButton />}
      </div>

      {/* Profile Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info Card */}
        {flags.healthProfileSection && patientInfo && (
          <PersonalInfoCard
            firstName={patientInfo.firstName}
            lastName={patientInfo.lastName}
            dateOfBirth={patientInfo.dateOfBirth}
            bloodType={patientInfo.bloodType}
            email={patientInfo.email}
            phone={patientInfo.phone}
          />
        )}

        {/* Emergency Contacts */}
        {flags.healthProfileSection && (
          <EmergencyContactsCard
            contacts={emergencyContacts}
            onAdd={handleAddContact}
            onEdit={handleEditContact}
            onDelete={(contact) =>
              handleDelete({ type: 'contact', id: contact.id, name: contact.name })
            }
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Health Info Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Allergies */}
        {flags.allergiesSection && (
          <AllergiesCard
            allergies={allergies}
            onAdd={handleAddAllergy}
            onEdit={handleEditAllergy}
            onDelete={(allergy) =>
              handleDelete({ type: 'allergy', id: allergy.id, name: allergy.name })
            }
            isLoading={isLoading}
          />
        )}

        {/* Chronic Conditions */}
        {flags.chronicConditionsSection && (
          <ChronicConditionsCard
            conditions={chronicConditions}
            onAdd={handleAddCondition}
            onEdit={handleEditCondition}
            onDelete={(condition) =>
              handleDelete({ type: 'condition', id: condition.id, name: condition.name })
            }
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Medications - Full Width */}
      {flags.medicationsSection && (
        <CurrentMedicationsCard
          medications={medications}
          onAdd={handleAddMedication}
          onEdit={handleEditMedication}
          onDelete={(medication) =>
            handleDelete({ type: 'medication', id: medication.id, name: medication.name })
          }
          isLoading={isLoading}
        />
      )}

      {/* Dialogs */}
      <AddEmergencyContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSubmit={handleContactSubmit}
        editData={editContact}
        isLoading={isLoading}
      />

      <AddAllergyDialog
        open={allergyDialogOpen}
        onOpenChange={setAllergyDialogOpen}
        onSubmit={handleAllergySubmit}
        editData={editAllergy}
        isLoading={isLoading}
      />

      <AddChronicConditionDialog
        open={conditionDialogOpen}
        onOpenChange={setConditionDialogOpen}
        onSubmit={handleConditionSubmit}
        editData={editCondition}
        isLoading={isLoading}
      />

      <AddMedicationDialog
        open={medicationDialogOpen}
        onOpenChange={setMedicationDialogOpen}
        onSubmit={handleMedicationSubmit}
        editData={editMedication}
        isLoading={isLoading}
      />

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.type || 'item'}?`}
        itemName={deleteTarget?.name}
        description="This action cannot be undone. This will permanently remove this item from your health profile."
        isLoading={isLoading}
      />
    </div>
  );
};

export default OverviewTab;

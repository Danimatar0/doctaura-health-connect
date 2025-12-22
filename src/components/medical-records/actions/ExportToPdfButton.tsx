/**
 * Export to PDF Button Component
 *
 * Generates a comprehensive PDF report of the patient's health profile.
 * Uses jsPDF for document generation with formatted sections.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { FileDown, Loader2, FileText, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
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

interface PatientInfo {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bloodType?: string;
  email?: string;
  phone?: string;
}

interface ExportData {
  patientInfo?: PatientInfo;
  emergencyContacts?: EmergencyContact[];
  allergies?: Allergy[];
  chronicConditions?: ChronicCondition[];
  medications?: CurrentMedication[];
  heightWeightData?: HeightWeightReading[];
  bloodPressureData?: BloodPressureReading[];
  bloodSugarData?: BloodSugarReading[];
  medicalHistory?: PastMedicalEvent[];
  familyHistory?: FamilyMedicalHistory[];
  vaccinations?: VaccinationRecord[];
}

interface ExportToPdfButtonProps {
  data: ExportData;
  disabled?: boolean;
}

type ExportSection = 'all' | 'overview' | 'vitals' | 'history';

const ExportToPdfButton = ({ data, disabled = false }: ExportToPdfButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generatePdf = async (section: ExportSection) => {
    setIsExporting(true);

    try {
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Helper functions
      const addTitle = (title: string) => {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPos);
        yPos += 10;
      };

      const addSectionHeader = (header: string) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text(header, margin, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0);
      };

      const addText = (label: string, value: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}: `, margin, yPos);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(value, contentWidth - 40);
        doc.text(textLines, margin + doc.getTextWidth(`${label}: `), yPos);
        yPos += 5 * textLines.length;
      };

      const addListItem = (text: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(`• ${text}`, contentWidth);
        doc.text(textLines, margin + 5, yPos);
        yPos += 5 * textLines.length;
      };

      const addSpace = (space: number = 5) => {
        yPos += space;
      };

      // Document Header
      addTitle('Medical Records Report');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 15;

      // Patient Information (always included)
      if (data.patientInfo && (section === 'all' || section === 'overview')) {
        addSectionHeader('Patient Information');
        addText('Name', `${data.patientInfo.firstName || ''} ${data.patientInfo.lastName || ''}`.trim() || 'N/A');
        addText('Date of Birth', formatDate(data.patientInfo.dateOfBirth));
        if (data.patientInfo.bloodType) addText('Blood Type', data.patientInfo.bloodType);
        if (data.patientInfo.email) addText('Email', data.patientInfo.email);
        if (data.patientInfo.phone) addText('Phone', data.patientInfo.phone);
        addSpace(10);
      }

      // Emergency Contacts
      if (data.emergencyContacts?.length && (section === 'all' || section === 'overview')) {
        addSectionHeader('Emergency Contacts');
        data.emergencyContacts.forEach((contact) => {
          addListItem(`${contact.name} (${contact.relationship})${contact.isPrimary ? ' - PRIMARY' : ''}: ${contact.phone}`);
        });
        addSpace(10);
      }

      // Allergies
      if (data.allergies?.length && (section === 'all' || section === 'overview')) {
        addSectionHeader('Allergies');
        data.allergies.forEach((allergy) => {
          addListItem(`${allergy.name} - ${allergy.severity.toUpperCase()} (${allergy.category})`);
          if (allergy.reactions?.length) {
            doc.setFontSize(9);
            doc.text(`   Reactions: ${allergy.reactions.join(', ')}`, margin + 10, yPos);
            yPos += 5;
          }
        });
        addSpace(10);
      }

      // Chronic Conditions
      if (data.chronicConditions?.length && (section === 'all' || section === 'overview')) {
        addSectionHeader('Chronic Conditions');
        data.chronicConditions.forEach((condition) => {
          addListItem(`${condition.name} - ${condition.managementStatus.replace('-', ' ')}`);
          if (condition.diagnosedDate) {
            doc.setFontSize(9);
            doc.text(`   Diagnosed: ${formatDate(condition.diagnosedDate)}`, margin + 10, yPos);
            yPos += 5;
          }
        });
        addSpace(10);
      }

      // Current Medications
      if (data.medications?.length && (section === 'all' || section === 'overview')) {
        addSectionHeader('Current Medications');
        data.medications.forEach((med) => {
          addListItem(`${med.name} ${med.dosage} - ${med.frequency.replace('-', ' ')}`);
          if (med.purpose) {
            doc.setFontSize(9);
            doc.text(`   Purpose: ${med.purpose}`, margin + 10, yPos);
            yPos += 5;
          }
        });
        addSpace(10);
      }

      // Vital Signs - Latest readings
      if (section === 'all' || section === 'vitals') {
        if (data.heightWeightData?.length || data.bloodPressureData?.length || data.bloodSugarData?.length) {
          addSectionHeader('Vital Signs (Latest)');

          if (data.heightWeightData?.length) {
            const latest = data.heightWeightData[0];
            addListItem(`Height/Weight: ${latest.height || '-'} cm / ${latest.weight || '-'} kg (BMI: ${latest.bmi?.toFixed(1) || '-'}) - ${formatDate(latest.date)}`);
          }

          if (data.bloodPressureData?.length) {
            const latest = data.bloodPressureData[0];
            addListItem(`Blood Pressure: ${latest.systolic}/${latest.diastolic} mmHg${latest.pulse ? `, ${latest.pulse} bpm` : ''} - ${formatDate(latest.date)}`);
          }

          if (data.bloodSugarData?.length) {
            const latest = data.bloodSugarData[0];
            addListItem(`Blood Sugar: ${latest.value} ${latest.unit} (${latest.measurementType}) - ${formatDate(latest.date)}`);
          }
          addSpace(10);
        }
      }

      // Medical History
      if (data.medicalHistory?.length && (section === 'all' || section === 'history')) {
        addSectionHeader('Medical History');
        data.medicalHistory.forEach((event) => {
          addListItem(`${formatDate(event.date)} - ${event.title} (${event.type})`);
          if (event.description) {
            doc.setFontSize(9);
            const descLines = doc.splitTextToSize(event.description, contentWidth - 20);
            doc.text(descLines, margin + 10, yPos);
            yPos += 5 * descLines.length;
          }
        });
        addSpace(10);
      }

      // Family History
      if (data.familyHistory?.length && (section === 'all' || section === 'history')) {
        addSectionHeader('Family Medical History');
        data.familyHistory.forEach((entry) => {
          addListItem(`${entry.relationship}: ${entry.condition}${entry.ageAtDiagnosis ? ` (diagnosed at age ${entry.ageAtDiagnosis})` : ''}`);
        });
        addSpace(10);
      }

      // Vaccinations
      if (data.vaccinations?.length && (section === 'all' || section === 'history')) {
        addSectionHeader('Vaccination Records');
        data.vaccinations.forEach((vaccine) => {
          addListItem(`${vaccine.vaccineName} - ${formatDate(vaccine.dateAdministered)}${vaccine.doseNumber && vaccine.totalDoses ? ` (Dose ${vaccine.doseNumber}/${vaccine.totalDoses})` : ''}`);
          if (vaccine.nextDueDate) {
            doc.setFontSize(9);
            doc.text(`   Next due: ${formatDate(vaccine.nextDueDate)}`, margin + 10, yPos);
            yPos += 5;
          }
        });
      }

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | Generated by DoctAura Health Connect`,
          pageWidth / 2,
          290,
          { align: 'center' }
        );
      }

      // Download
      const filename = `medical-records-${section}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Export PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => generatePdf('all')}>
          <FileCheck className="h-4 w-4 mr-2" />
          Complete Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePdf('overview')}>
          <FileText className="h-4 w-4 mr-2" />
          Overview Only
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePdf('vitals')}>
          <FileText className="h-4 w-4 mr-2" />
          Vitals Summary
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePdf('history')}>
          <FileText className="h-4 w-4 mr-2" />
          Medical History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportToPdfButton;

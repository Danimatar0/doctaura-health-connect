/**
 * Add/Edit Medication Dialog Component
 *
 * Form dialog for creating or editing current medications.
 * Includes dosage, frequency, and prescription details.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { currentMedicationSchema, type CurrentMedicationFormData } from '@/schemas/healthProfile.schemas';
import type { CurrentMedication } from '@/types/healthProfile.types';
import { MEDICATION_FREQUENCY_LABELS } from '@/types/healthProfile.types';

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CurrentMedicationFormData) => void;
  editData?: CurrentMedication | null;
  isLoading?: boolean;
}

const AddMedicationDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddMedicationDialogProps) => {
  const form = useForm<CurrentMedicationFormData>({
    resolver: zodResolver(currentMedicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequency: 'once-daily',
      prescribedBy: '',
      startDate: '',
      purpose: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        dosage: editData.dosage,
        frequency: editData.frequency,
        prescribedBy: editData.prescribedBy || '',
        startDate: editData.startDate || '',
        purpose: editData.purpose || '',
        notes: editData.notes || '',
      });
    } else {
      form.reset({
        name: '',
        dosage: '',
        frequency: 'once-daily',
        prescribedBy: '',
        startDate: '',
        purpose: '',
        notes: '',
      });
    }
  }, [editData, form, open]);

  const handleSubmit = (data: CurrentMedicationFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Medication' : 'Add Medication'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update medication information.'
              : 'Add a current medication to your health profile.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Medication Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Metformin, Lisinopril" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500mg, 10mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MEDICATION_FREQUENCY_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prescribedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescribed By</FormLabel>
                    <FormControl>
                      <Input placeholder="Doctor's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blood sugar control, Blood pressure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special instructions, side effects, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Medication'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationDialog;

/**
 * Add/Edit Vaccination Dialog Component
 *
 * Form dialog for creating or editing vaccination records.
 * Includes dose tracking and next due date scheduling.
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { vaccinationRecordSchema, type VaccinationRecordFormData } from '@/schemas/healthProfile.schemas';
import type { VaccinationRecord } from '@/types/healthProfile.types';

interface AddVaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VaccinationRecordFormData) => void;
  editData?: VaccinationRecord | null;
  isLoading?: boolean;
}

const AddVaccinationDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddVaccinationDialogProps) => {
  const form = useForm<VaccinationRecordFormData>({
    resolver: zodResolver(vaccinationRecordSchema),
    defaultValues: {
      vaccineName: '',
      dateAdministered: '',
      nextDueDate: '',
      doseNumber: undefined,
      totalDoses: undefined,
      lotNumber: '',
      manufacturer: '',
      facility: '',
      administeredBy: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        vaccineName: editData.vaccineName,
        dateAdministered: editData.dateAdministered,
        nextDueDate: editData.nextDueDate || '',
        doseNumber: editData.doseNumber,
        totalDoses: editData.totalDoses,
        lotNumber: editData.lotNumber || '',
        manufacturer: editData.manufacturer || '',
        facility: editData.facility || '',
        administeredBy: editData.administeredBy || '',
        notes: editData.notes || '',
      });
    } else {
      form.reset({
        vaccineName: '',
        dateAdministered: '',
        nextDueDate: '',
        doseNumber: undefined,
        totalDoses: undefined,
        lotNumber: '',
        manufacturer: '',
        facility: '',
        administeredBy: '',
        notes: '',
      });
    }
  }, [editData, form, open]);

  const handleSubmit = (data: VaccinationRecordFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Vaccination Record' : 'Add Vaccination Record'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update vaccination record information.'
              : 'Add a vaccination to your immunization history.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vaccineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., COVID-19, Influenza, Tetanus"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateAdministered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Administered *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      For vaccines requiring boosters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="doseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dose Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 1"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseInt(value, 10));
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalDoses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Doses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 2"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseInt(value, 10));
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pfizer, Moderna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Vaccine lot number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility</FormLabel>
                    <FormControl>
                      <Input placeholder="Clinic/Hospital name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="administeredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administered By</FormLabel>
                    <FormControl>
                      <Input placeholder="Healthcare provider" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Side effects, reactions, or other notes..."
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
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Vaccination'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVaccinationDialog;

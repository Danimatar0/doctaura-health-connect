/**
 * Add/Edit Chronic Condition Dialog Component
 *
 * Form dialog for creating or editing chronic condition records.
 * Includes management status and medication association.
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
import { chronicConditionSchema, type ChronicConditionFormData } from '@/schemas/healthProfile.schemas';
import type { ChronicCondition } from '@/types/healthProfile.types';
import { CONDITION_MANAGEMENT_STATUS_LABELS } from '@/types/healthProfile.types';

interface AddChronicConditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChronicConditionFormData) => void;
  editData?: ChronicCondition | null;
  isLoading?: boolean;
}

const AddChronicConditionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddChronicConditionDialogProps) => {
  const form = useForm<ChronicConditionFormData>({
    resolver: zodResolver(chronicConditionSchema),
    defaultValues: {
      name: '',
      diagnosedDate: '',
      managementStatus: 'well-controlled',
      managedBy: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        diagnosedDate: editData.diagnosedDate || '',
        managementStatus: editData.managementStatus,
        managedBy: editData.managedBy || '',
        notes: editData.notes || '',
      });
    } else {
      form.reset({
        name: '',
        diagnosedDate: '',
        managementStatus: 'well-controlled',
        managedBy: '',
        notes: '',
      });
    }
  }, [editData, form, open]);

  const handleSubmit = (data: ChronicConditionFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Chronic Condition' : 'Add Chronic Condition'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update condition information.'
              : 'Add a chronic condition to track in your health profile.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Type 2 Diabetes, Hypertension" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Diagnosed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managementStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Management Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CONDITION_MANAGEMENT_STATUS_LABELS).map(
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
              name="managedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Managed By</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Smith, Cardiology Clinic" {...field} />
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
                      placeholder="Treatment details, management plan, etc."
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
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Condition'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChronicConditionDialog;

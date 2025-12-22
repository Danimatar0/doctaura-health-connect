/**
 * Add/Edit Past Medical Event Dialog Component
 *
 * Form dialog for creating or editing past medical history events.
 * Includes event type selection and outcome documentation.
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
import { pastMedicalEventSchema, type PastMedicalEventFormData } from '@/schemas/healthProfile.schemas';
import type { PastMedicalEvent } from '@/types/healthProfile.types';
import { MEDICAL_EVENT_TYPE_LABELS } from '@/types/healthProfile.types';

interface AddPastEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PastMedicalEventFormData) => void;
  editData?: PastMedicalEvent | null;
  isLoading?: boolean;
}

const AddPastEventDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddPastEventDialogProps) => {
  const form = useForm<PastMedicalEventFormData>({
    resolver: zodResolver(pastMedicalEventSchema),
    defaultValues: {
      type: 'diagnosis',
      title: '',
      date: '',
      description: '',
      facility: '',
      doctorName: '',
      outcome: '',
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        type: editData.type,
        title: editData.title,
        date: editData.date,
        description: editData.description || '',
        facility: editData.facility || '',
        doctorName: editData.doctorName || '',
        outcome: editData.outcome || '',
      });
    } else {
      form.reset({
        type: 'diagnosis',
        title: '',
        date: '',
        description: '',
        facility: '',
        doctorName: '',
        outcome: '',
      });
    }
  }, [editData, form, open]);

  const handleSubmit = (data: PastMedicalEventFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Medical Event' : 'Add Medical Event'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update medical event information.'
              : 'Add a past medical event to your health history.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MEDICAL_EVENT_TYPE_LABELS).map(
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Appendectomy, Hip Fracture, Pneumonia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about the event, procedure, or diagnosis..."
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
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility</FormLabel>
                    <FormControl>
                      <Input placeholder="Hospital/Clinic name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <FormControl>
                      <Input placeholder="Physician's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Recovery status, ongoing effects, follow-up needed..."
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
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPastEventDialog;

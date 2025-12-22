/**
 * Add/Edit Family History Dialog Component
 *
 * Form dialog for creating or editing family medical history.
 * Includes relationship selection and hereditary risk factors.
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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { familyMedicalHistorySchema, type FamilyMedicalHistoryFormData } from '@/schemas/healthProfile.schemas';
import type { FamilyMedicalHistory } from '@/types/healthProfile.types';
import { FAMILY_RELATIONSHIP_LABELS } from '@/types/healthProfile.types';

interface AddFamilyHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FamilyMedicalHistoryFormData) => void;
  editData?: FamilyMedicalHistory | null;
  isLoading?: boolean;
}

const AddFamilyHistoryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddFamilyHistoryDialogProps) => {
  const form = useForm<FamilyMedicalHistoryFormData>({
    resolver: zodResolver(familyMedicalHistorySchema),
    defaultValues: {
      relationship: 'other',
      relationshipDetails: '',
      condition: '',
      ageAtDiagnosis: undefined,
      isDeceased: false,
      ageAtDeath: undefined,
      notes: '',
    },
  });

  const isDeceased = form.watch('isDeceased');

  useEffect(() => {
    if (editData) {
      form.reset({
        relationship: editData.relationship,
        relationshipDetails: editData.relationshipDetails || '',
        condition: editData.condition,
        ageAtDiagnosis: editData.ageAtDiagnosis,
        isDeceased: editData.isDeceased || false,
        ageAtDeath: editData.ageAtDeath,
        notes: editData.notes || '',
      });
    } else {
      form.reset({
        relationship: 'other',
        relationshipDetails: '',
        condition: '',
        ageAtDiagnosis: undefined,
        isDeceased: false,
        ageAtDeath: undefined,
        notes: '',
      });
    }
  }, [editData, form, open]);

  const handleSubmit = (data: FamilyMedicalHistoryFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Family History' : 'Add Family History'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update family medical history information.'
              : 'Add a family member\'s medical condition to your health profile.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(FAMILY_RELATIONSHIP_LABELS).map(
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
                name="relationshipDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Maternal grandmother" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Heart Disease, Diabetes, Cancer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ageAtDiagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age at Diagnosis</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Age when diagnosed"
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
              name="isDeceased"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Deceased</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Is this family member deceased?
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isDeceased && (
              <FormField
                control={form.control}
                name="ageAtDeath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age at Death</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Age at time of death"
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
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the condition or family member..."
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
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFamilyHistoryDialog;

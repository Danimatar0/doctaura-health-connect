/**
 * Add/Edit Emergency Contact Dialog Component
 *
 * Form dialog for creating or editing emergency contacts.
 * Includes relationship selection and primary contact toggle.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { emergencyContactSchema, type EmergencyContactFormData } from '@/schemas/healthProfile.schemas';
import type { EmergencyContact } from '@/types/healthProfile.types';
import { EMERGENCY_CONTACT_RELATIONSHIP_LABELS } from '@/types/healthProfile.types';

interface AddEmergencyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EmergencyContactFormData) => void;
  editData?: EmergencyContact | null;
  isLoading?: boolean;
}

const AddEmergencyContactDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddEmergencyContactDialogProps) => {
  const form = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      phone: '',
      relationship: 'other',
      email: '',
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        phone: editData.phone,
        relationship: editData.relationship,
        email: editData.email || '',
        isPrimary: editData.isPrimary,
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        relationship: 'other',
        email: '',
        isPrimary: false,
      });
    }
  }, [editData, form, open]);

  const handleSubmit = (data: EmergencyContactFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update the emergency contact information.'
              : 'Add a new emergency contact to your profile.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {Object.entries(EMERGENCY_CONTACT_RELATIONSHIP_LABELS).map(
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
              name="isPrimary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Primary Contact</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Set as primary emergency contact
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
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmergencyContactDialog;

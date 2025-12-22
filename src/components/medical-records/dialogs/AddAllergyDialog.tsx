/**
 * Add/Edit Allergy Dialog Component
 *
 * Form dialog for creating or editing allergy records.
 * Includes severity selection and reaction tags.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { allergySchema, type AllergyFormData } from '@/schemas/healthProfile.schemas';
import type { Allergy } from '@/types/healthProfile.types';
import {
  ALLERGY_CATEGORY_LABELS,
  ALLERGY_SEVERITY_LABELS,
} from '@/types/healthProfile.types';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AddAllergyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AllergyFormData) => void;
  editData?: Allergy | null;
  isLoading?: boolean;
}

const AddAllergyDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading = false,
}: AddAllergyDialogProps) => {
  const [reactionInput, setReactionInput] = useState('');

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      name: '',
      category: 'other',
      severity: 'mild',
      reactions: [],
      notes: '',
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        category: editData.category,
        severity: editData.severity,
        reactions: editData.reactions || [],
        notes: editData.notes || '',
      });
    } else {
      form.reset({
        name: '',
        category: 'other',
        severity: 'mild',
        reactions: [],
        notes: '',
      });
    }
    setReactionInput('');
  }, [editData, form, open]);

  const handleSubmit = (data: AllergyFormData) => {
    onSubmit(data);
  };

  const addReaction = () => {
    if (reactionInput.trim()) {
      const currentReactions = form.getValues('reactions') || [];
      if (!currentReactions.includes(reactionInput.trim())) {
        form.setValue('reactions', [...currentReactions, reactionInput.trim()]);
      }
      setReactionInput('');
    }
  };

  const removeReaction = (reaction: string) => {
    const currentReactions = form.getValues('reactions') || [];
    form.setValue(
      'reactions',
      currentReactions.filter((r) => r !== reaction)
    );
  };

  const reactions = form.watch('reactions') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Allergy' : 'Add Allergy'}</DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update allergy information.'
              : 'Add a new allergy to your health profile.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergen Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Penicillin, Peanuts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ALLERGY_CATEGORY_LABELS).map(
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
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ALLERGY_SEVERITY_LABELS).map(
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
              name="reactions"
              render={() => (
                <FormItem>
                  <FormLabel>Reactions</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Hives, Swelling"
                      value={reactionInput}
                      onChange={(e) => setReactionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addReaction();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addReaction}>
                      Add
                    </Button>
                  </div>
                  {reactions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reactions.map((reaction) => (
                        <Badge
                          key={reaction}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {reaction}
                          <button
                            type="button"
                            onClick={() => removeReaction(reaction)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>
                    Press Enter or click Add to add a reaction
                  </FormDescription>
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
                      placeholder="Additional notes about this allergy..."
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
                {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Allergy'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAllergyDialog;

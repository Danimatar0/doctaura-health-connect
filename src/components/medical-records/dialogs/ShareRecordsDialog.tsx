/**
 * Share Records Dialog Component
 *
 * Dialog for sharing medical records with healthcare providers.
 * Includes section selection and consent acknowledgment.
 */

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shareRecordsSchema, type ShareRecordsFormData } from '@/schemas/healthProfile.schemas';
import { Shield, Share2, CheckCircle } from 'lucide-react';

interface ShareRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShareRecordsFormData) => void;
  isLoading?: boolean;
}

const SHAREABLE_SECTIONS = [
  { id: 'personalInfo', label: 'Personal Information' },
  { id: 'emergencyContacts', label: 'Emergency Contacts' },
  { id: 'allergies', label: 'Allergies' },
  { id: 'chronicConditions', label: 'Chronic Conditions' },
  { id: 'medications', label: 'Current Medications' },
  { id: 'vitalSigns', label: 'Vital Signs History' },
  { id: 'medicalHistory', label: 'Medical History' },
  { id: 'familyHistory', label: 'Family Medical History' },
  { id: 'vaccinations', label: 'Vaccination Records' },
] as const;

const ShareRecordsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ShareRecordsDialogProps) => {
  const [shareSuccess, setShareSuccess] = useState(false);

  const form = useForm<ShareRecordsFormData>({
    resolver: zodResolver(shareRecordsSchema),
    defaultValues: {
      recipientEmail: '',
      recipientName: '',
      message: '',
      sections: [],
      expiresInDays: 7,
      consentAcknowledged: false,
    },
  });

  const handleSubmit = (data: ShareRecordsFormData) => {
    onSubmit(data);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      onOpenChange(false);
      form.reset();
    }, 2000);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShareSuccess(false);
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const selectedSections = form.watch('sections') || [];

  if (shareSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Records Shared Successfully</h3>
            <p className="text-sm text-muted-foreground mt-2">
              An access link has been sent to the recipient.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Medical Records
          </DialogTitle>
          <DialogDescription>
            Securely share your health records with a healthcare provider. They will
            receive a time-limited access link.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doctor@hospital.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sections"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Select Sections to Share *</FormLabel>
                    <FormDescription>
                      Choose which parts of your health profile to include
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SHAREABLE_SECTIONS.map((section) => (
                      <FormField
                        key={section.id}
                        control={form.control}
                        name="sections"
                        render={({ field }) => (
                          <FormItem
                            key={section.id}
                            className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(section.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, section.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== section.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer flex-1">
                              {section.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  {selectedSections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedSections.map((sectionId) => {
                        const section = SHAREABLE_SECTIONS.find(
                          (s) => s.id === sectionId
                        );
                        return (
                          <Badge key={sectionId} variant="secondary" className="text-xs">
                            {section?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresInDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Expires In *</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    >
                      <option value={1}>1 day</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a message for the recipient..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy Notice */}
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Privacy Notice</p>
                  <p>
                    Your data is encrypted end-to-end. The recipient will only have
                    access to the sections you select, and access will expire
                    automatically after the specified time.
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="consentAcknowledged"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I consent to sharing my medical records *</FormLabel>
                    <FormDescription>
                      I understand that the selected information will be shared with
                      the specified healthcare provider.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sharing...' : 'Share Records'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRecordsDialog;

/**
 * Add Vital Reading Dialog Component
 *
 * Multi-type dialog for adding vital sign readings.
 * Supports height/weight, blood pressure, and blood sugar entries.
 */

import { useEffect, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  heightWeightSchema,
  bloodPressureSchema,
  bloodSugarSchema,
  type HeightWeightFormData,
  type BloodPressureFormData,
  type BloodSugarFormData,
} from '@/schemas/healthProfile.schemas';
import { BLOOD_SUGAR_MEASUREMENT_LABELS } from '@/types/healthProfile.types';
import { Scale, Heart, Droplets } from 'lucide-react';

type VitalType = 'height-weight' | 'blood-pressure' | 'blood-sugar';

interface AddVitalReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitHeightWeight: (data: HeightWeightFormData) => void;
  onSubmitBloodPressure: (data: BloodPressureFormData) => void;
  onSubmitBloodSugar: (data: BloodSugarFormData) => void;
  defaultType?: VitalType;
  isLoading?: boolean;
}

const AddVitalReadingDialog = ({
  open,
  onOpenChange,
  onSubmitHeightWeight,
  onSubmitBloodPressure,
  onSubmitBloodSugar,
  defaultType = 'height-weight',
  isLoading = false,
}: AddVitalReadingDialogProps) => {
  const [activeTab, setActiveTab] = useState<VitalType>(defaultType);

  // Height/Weight form
  const heightWeightForm = useForm<HeightWeightFormData>({
    resolver: zodResolver(heightWeightSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      height: undefined,
      weight: undefined,
      notes: '',
    },
  });

  // Blood Pressure form
  const bloodPressureForm = useForm<BloodPressureFormData>({
    resolver: zodResolver(bloodPressureSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      systolic: undefined,
      diastolic: undefined,
      pulse: undefined,
      notes: '',
    },
  });

  // Blood Sugar form
  const bloodSugarForm = useForm<BloodSugarFormData>({
    resolver: zodResolver(bloodSugarSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      value: undefined,
      unit: 'mg/dL',
      measurementType: 'fasting',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      setActiveTab(defaultType);
      heightWeightForm.reset({
        date: new Date().toISOString().split('T')[0],
        height: undefined,
        weight: undefined,
        notes: '',
      });
      bloodPressureForm.reset({
        date: new Date().toISOString().split('T')[0],
        systolic: undefined,
        diastolic: undefined,
        pulse: undefined,
        notes: '',
      });
      bloodSugarForm.reset({
        date: new Date().toISOString().split('T')[0],
        value: undefined,
        unit: 'mg/dL',
        measurementType: 'fasting',
        notes: '',
      });
    }
  }, [open, defaultType, heightWeightForm, bloodPressureForm, bloodSugarForm]);

  const handleHeightWeightSubmit = (data: HeightWeightFormData) => {
    onSubmitHeightWeight(data);
    onOpenChange(false);
  };

  const handleBloodPressureSubmit = (data: BloodPressureFormData) => {
    onSubmitBloodPressure(data);
    onOpenChange(false);
  };

  const handleBloodSugarSubmit = (data: BloodSugarFormData) => {
    onSubmitBloodSugar(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Vital Reading</DialogTitle>
          <DialogDescription>
            Record a new vital sign measurement.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VitalType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="height-weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Weight</span>
            </TabsTrigger>
            <TabsTrigger value="blood-pressure" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">BP</span>
            </TabsTrigger>
            <TabsTrigger value="blood-sugar" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Sugar</span>
            </TabsTrigger>
          </TabsList>

          {/* Height/Weight Tab */}
          <TabsContent value="height-weight" className="mt-4">
            <Form {...heightWeightForm}>
              <form
                onSubmit={heightWeightForm.handleSubmit(handleHeightWeightSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={heightWeightForm.control}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={heightWeightForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="170"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={heightWeightForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="70"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormDescription>
                  BMI will be calculated automatically if both height and weight are provided.
                </FormDescription>

                <FormField
                  control={heightWeightForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Optional notes..." {...field} />
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
                    {isLoading ? 'Saving...' : 'Add Reading'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* Blood Pressure Tab */}
          <TabsContent value="blood-pressure" className="mt-4">
            <Form {...bloodPressureForm}>
              <form
                onSubmit={bloodPressureForm.handleSubmit(handleBloodPressureSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={bloodPressureForm.control}
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

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={bloodPressureForm.control}
                    name="systolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Systolic *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseInt(value, 10));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">mmHg</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bloodPressureForm.control}
                    name="diastolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diastolic *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="80"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseInt(value, 10));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">mmHg</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bloodPressureForm.control}
                    name="pulse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pulse</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="72"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseInt(value, 10));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">bpm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bloodPressureForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., After exercise, at rest..." {...field} />
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
                    {isLoading ? 'Saving...' : 'Add Reading'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* Blood Sugar Tab */}
          <TabsContent value="blood-sugar" className="mt-4">
            <Form {...bloodSugarForm}>
              <form
                onSubmit={bloodSugarForm.handleSubmit(handleBloodSugarSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={bloodSugarForm.control}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bloodSugarForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Sugar Value *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="100"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bloodSugarForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mg/dL">mg/dL</SelectItem>
                            <SelectItem value="mmol/L">mmol/L</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bloodSugarForm.control}
                  name="measurementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Measurement Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(BLOOD_SUGAR_MEASUREMENT_LABELS).map(
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
                  control={bloodSugarForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Before breakfast, 2 hours after meal..." {...field} />
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
                    {isLoading ? 'Saving...' : 'Add Reading'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddVitalReadingDialog;

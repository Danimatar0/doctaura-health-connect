import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlockedTimeSlot, BlockedTimeReason } from "@/types";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (blockData: Omit<BlockedTimeSlot, "id" | "doctorId" | "createdAt">) => void;
  clinicId: string;
}

const reasonOptions = [
  { value: "holiday", label: "Holiday", icon: "🏖️" },
  { value: "break", label: "Break", icon: "☕" },
  { value: "emergency", label: "Emergency", icon: "🚨" },
  { value: "personal-leave", label: "Personal Leave", icon: "🏥" },
  { value: "custom", label: "Custom", icon: "✏️" },
];

const BlockTimeDialog = ({ open, onOpenChange, onSave, clinicId }: BlockTimeDialogProps) => {
  const [isDateRange, setIsDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState<BlockedTimeReason>("holiday");
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = () => {
    setIsDateRange(false);
    setStartDate("");
    setEndDate("");
    setIsAllDay(true);
    setStartTime("09:00");
    setEndTime("17:00");
    setReason("holiday");
    setCustomReason("");
    setNote("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (isDateRange && !endDate) {
      newErrors.endDate = "End date is required";
    }

    if (isDateRange && startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!isAllDay) {
      if (!startTime) {
        newErrors.startTime = "Start time is required";
      }
      if (!endTime) {
        newErrors.endTime = "End time is required";
      }

      if (startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (endTotalMinutes <= startTotalMinutes) {
          newErrors.endTime = "End time must be after start time";
        }
      }
    }

    if (reason === "custom" && !customReason.trim()) {
      newErrors.customReason = "Custom reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const blockData: Omit<BlockedTimeSlot, "id" | "doctorId" | "createdAt"> = {
      clinicId,
      startDate,
      endDate: isDateRange ? endDate : startDate,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      isAllDay,
      reason,
      customReason: reason === "custom" ? customReason : undefined,
      note: note.trim() || undefined,
    };

    onSave(blockData);
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Block Time Slot</DialogTitle>
          <DialogDescription>
            Block time in your schedule when you're unavailable for appointments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Type Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Block Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!isDateRange ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  !isDateRange && "gradient-hero text-white"
                )}
                onClick={() => {
                  setIsDateRange(false);
                  setEndDate("");
                }}
              >
                Single Day
              </Button>
              <Button
                type="button"
                variant={isDateRange ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  isDateRange && "gradient-hero text-white"
                )}
                onClick={() => setIsDateRange(true)}
              >
                Date Range
              </Button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label htmlFor="start-date" className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {isDateRange ? "Start Date" : "Select Date"}
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) {
                  setErrors({ ...errors, startDate: "" });
                }
              }}
              className={cn(errors.startDate && "border-destructive")}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.startDate}
              </p>
            )}
          </div>

          {isDateRange && (
            <div className="space-y-3">
              <Label htmlFor="end-date" className="text-base font-semibold">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) {
                    setErrors({ ...errors, endDate: "" });
                  }
                }}
                className={cn(errors.endDate && "border-destructive")}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endDate}
                </p>
              )}
            </div>
          )}

          {/* All Day Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="all-day" className="text-base font-semibold cursor-pointer">
                All Day
              </Label>
              <p className="text-sm text-muted-foreground">
                Block the entire day
              </p>
            </div>
            <Switch
              id="all-day"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Time Selection */}
          {!isAllDay && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Time Period
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm">From</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (errors.startTime) {
                        setErrors({ ...errors, startTime: "" });
                      }
                    }}
                    className={cn(errors.startTime && "border-destructive")}
                  />
                  {errors.startTime && (
                    <p className="text-xs text-destructive">{errors.startTime}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm">To</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      if (errors.endTime) {
                        setErrors({ ...errors, endTime: "" });
                      }
                    }}
                    className={cn(errors.endTime && "border-destructive")}
                  />
                  {errors.endTime && (
                    <p className="text-xs text-destructive">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-base font-semibold">
              Reason
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => {
                setReason(value as BlockedTimeReason);
                if (value !== "custom") {
                  setCustomReason("");
                }
              }}
            >
              <SelectTrigger id="reason" className="w-full">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {reasonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {reason === "custom" && (
            <div className="space-y-3">
              <Label htmlFor="custom-reason" className="text-base font-semibold">
                Custom Reason
              </Label>
              <Input
                id="custom-reason"
                placeholder="Enter your reason..."
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (errors.customReason) {
                    setErrors({ ...errors, customReason: "" });
                  }
                }}
                className={cn(errors.customReason && "border-destructive")}
              />
              {errors.customReason && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.customReason}
                </p>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-3">
            <Label htmlFor="note" className="text-base font-semibold">
              Note <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Add any additional details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth"
          >
            Block Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockTimeDialog;

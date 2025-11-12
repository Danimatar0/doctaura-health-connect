import { useState } from "react";
import { BlockedTimeSlot, BlockedTimeReason } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface BlockedTimeListProps {
  blockedSlots: BlockedTimeSlot[];
  onDelete: (id: string) => void;
}

const reasonConfig: Record<BlockedTimeReason, { icon: string; color: string; borderColor: string }> = {
  holiday: { icon: "🏖️", color: "text-blue-600", borderColor: "border-l-blue-500" },
  break: { icon: "☕", color: "text-orange-600", borderColor: "border-l-orange-500" },
  emergency: { icon: "🚨", color: "text-red-600", borderColor: "border-l-red-500" },
  "personal-leave": { icon: "🏥", color: "text-purple-600", borderColor: "border-l-purple-500" },
  custom: { icon: "✏️", color: "text-gray-600", borderColor: "border-l-gray-500" },
};

const BlockedTimeList = ({ blockedSlots, onDelete }: BlockedTimeListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<BlockedTimeSlot | null>(null);

  const handleDeleteClick = (slot: BlockedTimeSlot) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (slotToDelete) {
      onDelete(slotToDelete.id);
      setSlotToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const formatDateRange = (slot: BlockedTimeSlot): string => {
    const startDate = parseISO(slot.startDate);
    const endDate = parseISO(slot.endDate);

    if (slot.startDate === slot.endDate) {
      // Single day
      return format(startDate, "MMM d, yyyy");
    } else {
      // Date range
      if (startDate.getFullYear() === endDate.getFullYear()) {
        return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
      } else {
        return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
      }
    }
  };

  const formatTimeRange = (slot: BlockedTimeSlot): string => {
    if (slot.isAllDay) {
      return "All Day";
    }

    if (slot.startTime && slot.endTime) {
      // Convert 24h to 12h format
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    }

    return "";
  };

  const getDisplayReason = (slot: BlockedTimeSlot): string => {
    if (slot.reason === "custom" && slot.customReason) {
      return slot.customReason;
    }

    const reasonLabels: Record<BlockedTimeReason, string> = {
      holiday: "Holiday",
      break: "Break",
      emergency: "Emergency",
      "personal-leave": "Personal Leave",
      custom: "Custom",
    };

    return reasonLabels[slot.reason];
  };

  // Sort slots by date (upcoming first)
  const sortedSlots = [...blockedSlots].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  if (sortedSlots.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground text-lg">No blocked time slots</p>
        <p className="text-sm text-muted-foreground mt-2">
          Click "Add Block Time" to create one
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sortedSlots.map((slot) => {
          const config = reasonConfig[slot.reason];

          return (
            <Card
              key={slot.id}
              className={cn(
                "shadow-soft border-l-4 hover:shadow-md transition-all",
                config.borderColor
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    {/* Reason with icon */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{config.icon}</span>
                      <h4 className={cn("font-semibold text-base", config.color)}>
                        {getDisplayReason(slot)}
                      </h4>
                    </div>

                    {/* Date and time */}
                    <p className="text-sm text-muted-foreground font-medium">
                      {formatDateRange(slot)} • {formatTimeRange(slot)}
                    </p>

                    {/* Note */}
                    {slot.note && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {slot.note}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(slot)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Blocked Time?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {slotToDelete && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{reasonConfig[slotToDelete.reason].icon}</span>
                      <span className="font-semibold">{getDisplayReason(slotToDelete)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateRange(slotToDelete)}
                    </p>
                  </div>
                )}
                <p>
                  This will make these time slots available for booking. This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlockedTimeList;

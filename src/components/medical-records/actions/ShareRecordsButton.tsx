/**
 * Share Records Button Component
 *
 * Button that opens the share records dialog.
 * Provides quick access to the sharing functionality.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { ShareRecordsDialog } from '../dialogs';
import type { ShareRecordsFormData } from '@/schemas/healthProfile.schemas';
import { toast } from 'sonner';

interface ShareRecordsButtonProps {
  onShare?: (data: ShareRecordsFormData) => Promise<void>;
  disabled?: boolean;
}

const ShareRecordsButton = ({
  onShare,
  disabled = false,
}: ShareRecordsButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (data: ShareRecordsFormData) => {
    setIsSharing(true);
    try {
      if (onShare) {
        await onShare(data);
      } else {
        // Mock implementation - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Sharing records with:', data);
      }
      toast.success(`Records shared successfully with ${data.recipientName}`);
    } catch (error) {
      console.error('Error sharing records:', error);
      toast.error('Failed to share records. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Records
      </Button>

      <ShareRecordsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleShare}
        isLoading={isSharing}
      />
    </>
  );
};

export default ShareRecordsButton;


"use client";

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from './ad-placeholder';
import { Loader2 } from 'lucide-react';

type AdDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isZipping: boolean;
};

export function AdDialog({ open, onOpenChange, onConfirm, isZipping }: AdDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your Download is Almost Ready</AlertDialogTitle>
          <AlertDialogDescription>
            Your download will begin shortly. We rely on ads to keep this service free. Thank you for your support!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center items-center h-64">
           {/* Replace with your ad-slot for a 300x250 ad */}
           <AdPlaceholder width={300} height={250} adSlot="YOUR_AD_SLOT_ID" />
        </div>
        <AlertDialogFooter>
           <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
           <Button onClick={onConfirm} disabled={isZipping}>
            {isZipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Continue to Download'}
           </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

type PremiumModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpgrade: () => void;
};

export function PremiumModal({ isOpen, onOpenChange, onUpgrade }: PremiumModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Sparkles />
            <span>Unlock Premium Features</span>
          </DialogTitle>
          <DialogDescription>
            Supercharge your workflow with Tixel Premium. Get access to exclusive features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-1 text-accent shrink-0" />
              <div>
                <h4 className="font-semibold">Batch Image Tiling</h4>
                <p className="text-sm text-muted-foreground">Process hundreds of images at once.</p>
              </div>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-1 text-accent shrink-0" />
              <div>
                <h4 className="font-semibold">High-Resolution Exports</h4>
                <p className="text-sm text-muted-foreground">Download your tiled textures in up to 8K resolution.</p>
              </div>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-1 text-accent shrink-0" />
              <div>
                <h4 className="font-semibold">Asynchronous Processing</h4>
                <p className="text-sm text-muted-foreground">Let us handle the tiling in the background while you work.</p>
              </div>
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onUpgrade} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Upgrade for $9.99/mo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { TixelLogo } from './logo';
import { PremiumModal } from './premium-modal';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HeaderProps = {
  isPremium: boolean;
  onUpgrade: () => void;
};

export function Header({ isPremium, onUpgrade }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();

  const handleUpgradeClick = () => {
    if (isPremium) {
      toast({
        title: "You're already a Premium user!",
        className: "bg-accent text-accent-foreground border-accent",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalUpgrade = () => {
    onUpgrade();
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="py-4 px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center justify-between max-w-none">
          <div className="flex items-center gap-3">
            <TixelLogo className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tighter text-foreground">Tixel</h1>
          </div>
          <Button onClick={handleUpgradeClick} variant={isPremium ? "ghost" : "default"} size="sm" className={isPremium ? "text-primary hover:text-primary" : ""}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isPremium ? 'Premium User' : 'Go Premium'}
          </Button>
        </div>
      </header>
      <PremiumModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} onUpgrade={handleModalUpgrade} />
    </>
  );
}

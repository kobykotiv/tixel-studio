
'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AdPlaceholderProps = {
  width: number;
  height: number;
  className?: string;
};

export function AdPlaceholder({ width, height, className }: AdPlaceholderProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center bg-muted/20 border-dashed text-muted-foreground p-2',
        className
      )}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      {/*
        Google AdSense code can be placed here.
        Make sure to use the correct ad unit size that matches the props.
      */}
      <div className="text-center">
        <p className="text-sm font-medium">Ad Placeholder</p>
        <p className="text-xs text-muted-foreground/80">{`${width}x${height}`}</p>
      </div>
    </Card>
  );
}

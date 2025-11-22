
'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

type AdPlaceholderProps = {
  width: number;
  height: number;
  className?: string;
  // You will get this from your AdSense account for each ad unit
  adSlot: string; 
};

export function AdPlaceholder({ width, height, className, adSlot }: AdPlaceholderProps) {
    React.useEffect(() => {
        try {
            // @ts-ignore
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center bg-muted/20 border-dashed text-muted-foreground p-2',
        className
      )}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
       {/* 
          This is the ad unit. Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual publisher ID.
          The 'data-ad-slot' is passed in via props. Make sure you create ad units in AdSense
          with the correct sizes to match the width and height props.
        */}
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
      ></ins>
    </Card>
  );
}

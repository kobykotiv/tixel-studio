
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
            if (window.adsbygoogle) {
                // @ts-ignore
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
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
          This is the ad unit. 
          1. Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual publisher ID.
          2. Make sure the 'data-ad-slot' (passed via props) matches an ad unit you created in AdSense.
          3. Ensure the width and height match the ad unit's size in AdSense.
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

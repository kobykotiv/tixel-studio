
"use client";

import * as React from 'react';
import { TixelLogo } from './logo';

export function Header() {

  return (
    <>
      <header className="py-4 px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center justify-between max-w-none">
          <div className="flex items-center gap-3">
            <TixelLogo className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tighter text-foreground">Tixel</h1>
          </div>
        </div>
      </header>
    </>
  );
}

"use client";

import type { TilingOptions } from '@/app/page';

type TiledPreviewProps = {
  imageUrl: string | null;
  tilingOptions: TilingOptions;
};

export function TiledPreview({ imageUrl, tilingOptions }: TiledPreviewProps) {
  const { rows, cols } = tilingOptions;
  const backgroundSize = `${100 / cols}% ${100 / rows}%`;

  return (
    <div className="w-full h-full max-w-[80vh] max-h-[80vh] aspect-square rounded-lg shadow-2xl shadow-primary/10 overflow-hidden bg-card border border-border">
      {imageUrl ? (
        <div
          className="w-full h-full transition-all duration-300 ease-in-out"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: backgroundSize,
            backgroundRepeat: 'repeat',
            imageRendering: 'pixelated', // For crisp pixels
          }}
          aria-label={`Tiled preview of image with ${rows} rows and ${cols} columns`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-8 bg-grid-pattern">
            <div className="text-center text-muted-foreground bg-background/80 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground">Tiled Texture Preview</h3>
                <p>Upload an image to see the magic happen.</p>
            </div>
        </div>
      )}
    </div>
  );
}

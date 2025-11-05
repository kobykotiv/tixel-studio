"use client";

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { UploadCloud, Download, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TilingOptions } from '@/app/App';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';

type TilingControlsProps = {
  onImageUpload: (files: File[]) => void;
  tilingOptions: TilingOptions;
  onTilingOptionsChange: (options: TilingOptions) => void;
  sourceImage: File | null;
  aiSuggestions: string[];
  isSuggesting: boolean;
  isBatchMode?: boolean;
  onDownload?: () => void;
};

export function TilingControls({
  onImageUpload,
  tilingOptions,
  onTilingOptionsChange,
  sourceImage,
  aiSuggestions,
  isSuggesting,
  isBatchMode = false,
  onDownload
}: TilingControlsProps) {
  const [isCustom, setIsCustom] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadPlaceholder = PlaceHolderImages.find(img => img.id === 'upload-placeholder');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageUpload(Array.from(event.target.files));
    }
  };

  const handleDownload = () => {
    if(onDownload){
      onDownload();
      return;
    }
    if (!sourceImage) {
      toast({
        variant: 'destructive',
        title: 'No Image',
        description: 'Please upload an image first.',
      });
      return;
    }

    const img = document.createElement('img');
    img.src = URL.createObjectURL(sourceImage);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 4096;
      const scale = Math.min(maxDim / (img.width * tilingOptions.cols), maxDim / (img.height * tilingOptions.rows), 1);
      
      canvas.width = Math.round(img.width * tilingOptions.cols * scale);
      canvas.height = Math.round(img.height * tilingOptions.rows * scale);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = false;

      for (let y = 0; y < tilingOptions.rows; y++) {
        for (let x = 0; x < tilingOptions.cols; x++) {
          ctx.drawImage(img, x * img.width * scale, y * img.height * scale, img.width * scale, img.height * scale);
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tiled_${sourceImage.name.split('.')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.onerror = () => {
        toast({ variant: 'destructive', title: "Error loading image for download."})
    }
  };
  
  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const [cols, rows] = value.split('x').map(Number);
      onTilingOptionsChange({ rows, cols });
    }
  };

  const currentPreset = isCustom ? 'custom' : `${tilingOptions.cols}x${tilingOptions.rows}`;

  return (
    <div className="space-y-6">
      {!isBatchMode && (
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="font-semibold">Source Image</Label>
          <div
            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-primary/50 hover:border-primary transition-colors bg-muted/20 overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {sourceImage ? (
              <Image
                src={URL.createObjectURL(sourceImage)}
                alt="Source preview"
                fill
                className="object-contain rounded-lg p-2"
              />
            ) : (
              <>
                {uploadPlaceholder && 
                  <Image src={uploadPlaceholder.imageUrl} alt={uploadPlaceholder.description} data-ai-hint={uploadPlaceholder.imageHint} fill className="object-cover opacity-10" />
                }
                <div className="relative flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground/90">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, up to 10MB</p>
                </div>
              </>
            )}
          </div>
          <Input
            id="image-upload"
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
        </div>
      )}


      <div className="space-y-3">
        <Label className="font-semibold">Tiling Grid</Label>
        <RadioGroup onValueChange={handlePresetChange} value={currentPreset} className="grid grid-cols-4 gap-2">
          {['2x2', '4x4', '8x8', 'custom'].map(preset => (
            <div key={preset}>
              <RadioGroupItem value={preset} id={preset} className="sr-only" />
              <Label
                htmlFor={preset}
                className="flex h-14 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                {preset}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {isCustom && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Label htmlFor="cols">Columns: {tilingOptions.cols}</Label>
            <Label htmlFor="rows">Rows: {tilingOptions.rows}</Label>
            <Slider
              id="cols"
              min={1} max={32} step={1}
              value={[tilingOptions.cols]}
              onValueChange={([value]) => onTilingOptionsChange({ ...tilingOptions, cols: value })}
            />
            <Slider
              id="rows"
              min={1} max={32} step={1}
              value={[tilingOptions.rows]}
              onValueChange={([value]) => onTilingOptionsChange({ ...tilingOptions, rows: value })}
            />
        </div>
      )}
      
      {sourceImage && (
        <div className="space-y-3 pt-2">
          <Label className="font-semibold flex items-center gap-2">
            <Wand2 className="text-primary"/> AI Suggestions
          </Label>
          {isSuggesting ? (
             <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
             </div>
          ) : aiSuggestions.length > 0 ? (
             <div className="flex gap-2 flex-wrap">
                {aiSuggestions.map(suggestion => (
                    <Button key={suggestion} variant="outline" size="sm" onClick={() => handlePresetChange(suggestion)}>
                        {suggestion}
                    </Button>
                ))}
            </div>
          ) : (
             <p className="text-sm text-muted-foreground">Couldn't get suggestions for this image.</p>
          )}
        </div>
      )}

      {!isBatchMode && (
        <Button onClick={handleDownload} className="w-full !mt-8" size="lg" disabled={!sourceImage}>
          <Download className="mr-2" />
          Tile & Download
        </Button>
      )}
    </div>
  );
}

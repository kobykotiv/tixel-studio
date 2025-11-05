"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Trash2, FileArchive } from 'lucide-react';
import type { BatchFile, TilingOptions } from '@/app/App';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


type BatchQueueProps = {
  files: BatchFile[];
  onAddFiles: (files: File[]) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  tilingOptions: TilingOptions;
};

async function tileImage(file: File, tilingOptions: TilingOptions): Promise<Blob> {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => img.onload = resolve);
    
    const canvas = document.createElement('canvas');
    const maxDim = 4096;
    const scale = Math.min(maxDim / (img.width * tilingOptions.cols), maxDim / (img.height * tilingOptions.rows), 1);
    
    canvas.width = Math.round(img.width * tilingOptions.cols * scale);
    canvas.height = Math.round(img.height * tilingOptions.rows * scale);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < tilingOptions.rows; y++) {
      for (let x = 0; x < tilingOptions.cols; x++) {
        ctx.drawImage(img, x * img.width * scale, y * img.height * scale, img.width * scale, img.height * scale);
      }
    }
    
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
}


export function BatchQueue({ files, onAddFiles, onClearCompleted, onClearAll, tilingOptions }: BatchQueueProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isZipping, setIsZipping] = React.useState(false);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onAddFiles(Array.from(event.target.files));
    }
  };
  
  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed' || f.status === 'error');

  const handleDownloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) {
        toast({
            variant: "destructive",
            title: "No completed files",
            description: "There are no successfully tiled images to download."
        });
        return;
    }

    setIsZipping(true);
    toast({
        title: "Zipping files...",
        description: "Please wait while your tiled images are being prepared for download."
    });

    try {
        const zip = new JSZip();
        
        for (const fileItem of completedFiles) {
            const tiledBlob = await tileImage(fileItem.file, tilingOptions);
            zip.file(`tiled_${fileItem.file.name.split('.')[0]}.png`, tiledBlob);
        }

        const zipBlob = await zip.generateAsync({type: 'blob'});
        saveAs(zipBlob, 'tiled_images.zip');
        
        toast({
            title: "Download ready!",
            description: "Your zip file has been downloaded.",
            className: "bg-accent text-accent-foreground border-accent",
        });

    } catch (error) {
        console.error("Error zipping files:", error);
        toast({
            variant: "destructive",
            title: "Zipping failed",
            description: "Something went wrong while creating the zip file."
        });
    } finally {
        setIsZipping(false);
    }
  }

  return (
    <Card className="mt-6 border-0 shadow-none bg-transparent">
      <CardHeader className="p-0 mb-4">
        <CardTitle>Batch Queue</CardTitle>
        <CardDescription>Images added here will be tiled with the settings above.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {files.length === 0 ? (
          <div
            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-primary/50 hover:border-primary transition-colors bg-muted/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <UploadCloud className="w-10 h-10 mb-3 text-primary" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Upload multiple images</span>
              </p>
            </div>
            <input
              id="batch-upload"
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
          </div>
        ) : (
          <ScrollArea className="h-64 pr-4 -mr-4">
            <div className="space-y-4">
              {files.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg bg-muted/30">
                  <Image
                    src={URL.createObjectURL(item.file)}
                    alt={item.file.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover w-12 h-12 shrink-0"
                  />
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {item.status === 'completed' && <CheckCircle2 className="text-accent" />}
                    {item.status === 'processing' && <Loader2 className="animate-spin text-primary" />}
                    {item.status === 'queued' && <Loader2 className="text-muted-foreground" />}
                    {item.status === 'error' && <AlertCircle className="text-destructive" />}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {files.length > 0 && (
        <CardFooter className="flex flex-col gap-2 p-0 pt-4">
            <div className='flex gap-2 w-full'>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                    <UploadCloud className="mr-2 h-4 w-4"/> Add
                </Button>
                <Button variant="outline" onClick={onClearCompleted}>
                    <Trash2 className="mr-2 h-4 w-4"/> Clear Done
                </Button>
                 <Button variant="destructive" size="icon" onClick={onClearAll}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
            <Button disabled={!allCompleted || isZipping} onClick={handleDownloadAll} className="w-full">
                {isZipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileArchive className="mr-2 h-4 w-4"/> }
                {isZipping ? 'Zipping...' : 'Download All (.zip)'}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}

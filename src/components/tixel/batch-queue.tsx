
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Trash2, FileArchive } from 'lucide-react';
import type { BatchFile, TilingOptions } from '@/app/App';
import { CHUNK_SIZE } from '@/app/App';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AdPlaceholder } from './ad-placeholder';
import { AdDialog } from './ad-dialog';
import { formatBytes } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
    
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0));
}


export function BatchQueue({ files, onAddFiles, onClearCompleted, onClearAll, tilingOptions }: BatchQueueProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isZipping, setIsZipping] = React.useState(false);
  const [showAdDialog, setShowAdDialog] = React.useState(false);
  const [activeChunkForDownload, setActiveChunkForDownload] = React.useState<BatchFile[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onAddFiles(Array.from(event.target.files));
    }
  };

  const openAdDialogForChunk = (chunk: BatchFile[]) => {
      setActiveChunkForDownload(chunk);
      setShowAdDialog(true);
  }
  
  const handleDownloadChunk = async () => {
    if (activeChunkForDownload.length === 0) {
        toast({
            variant: "destructive",
            title: "No completed files in chunk",
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
        let totalOriginalSize = 0;
        
        for (const fileItem of activeChunkForDownload) {
            totalOriginalSize += fileItem.file.size;
            const tiledBlob = await tileImage(fileItem.file, tilingOptions);
            const originalFileName = fileItem.file.name.substring(0, fileItem.file.name.lastIndexOf('.')) || fileItem.file.name;
            zip.file(`tiled_${originalFileName}.png`, tiledBlob);
        }

        const chunkIndex = Math.floor(files.indexOf(activeChunkForDownload[0]) / CHUNK_SIZE) + 1;

        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });
        saveAs(zipBlob, `tiled_images_chunk_${chunkIndex}.zip`);
        
        const savings = totalOriginalSize - zipBlob.size;
        const percentageSaved = totalOriginalSize > 0 ? (savings / totalOriginalSize * 100).toFixed(1) : 0;
        
        toast({
            title: "Download ready!",
            description: `You saved ${formatBytes(savings)} (${percentageSaved}%)`,
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
        setShowAdDialog(false);
        setActiveChunkForDownload([]);
    }
  }

  const fileChunks = React.useMemo(() => {
    const chunks: BatchFile[][] = [];
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        chunks.push(files.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [files]);


  return (
    <>
    <AdDialog 
      open={showAdDialog} 
      onOpenChange={setShowAdDialog} 
      onConfirm={handleDownloadChunk}
      isZipping={isZipping}
    />
    <Card className="mt-6 border-0 shadow-none bg-transparent">
      <CardHeader className="p-0 mb-4">
        <CardTitle>Batch Queue</CardTitle>
        <CardDescription>Images are processed in chunks of {CHUNK_SIZE}. Download each chunk when it's ready.</CardDescription>
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
            <div className="space-y-6">
              {fileChunks.map((chunk, chunkIndex) => {
                 const isChunkComplete = chunk.every(f => f.status === 'completed');
                 const chunkProgress = chunk.reduce((acc, f) => acc + f.progress, 0) / chunk.length;
                 const isProcessing = chunk.some(f => f.status === 'processing');

                 return (
                    <div key={`chunk-${chunkIndex}`} className="space-y-2 p-3 rounded-lg bg-muted/20">
                      <div className='flex justify-between items-center'>
                        <h4 className="font-semibold">
                          Part {chunkIndex + 1}
                          <span className='ml-2 font-normal text-sm text-muted-foreground'>({chunk.length} images)</span>
                        </h4>
                        <Button size="sm" disabled={!isChunkComplete} onClick={() => openAdDialogForChunk(chunk)}>
                            <FileArchive className="mr-2 h-4 w-4"/> Zip Part {chunkIndex + 1}
                        </Button>
                      </div>
                      {isProcessing && <Progress value={chunkProgress} className="h-1 mt-1 mb-2" />}

                      {chunk.map(item => (
                          <div key={item.id} className="flex items-center gap-4 p-1.5 rounded-lg bg-muted/30">
                            <Image
                              src={URL.createObjectURL(item.file)}
                              alt={item.file.name}
                              width={32}
                              height={32}
                              className="rounded-md object-cover w-8 h-8 shrink-0"
                            />
                            <div className="flex-1 space-y-1 overflow-hidden">
                              <p className="text-xs font-medium truncate">{item.file.name}</p>
                              {item.status === 'processing' && <Progress value={item.progress} className="h-1" />}
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              {item.status === 'completed' && <CheckCircle2 className="text-accent w-4 h-4" />}
                              {item.status === 'processing' && <Loader2 className="animate-spin text-primary w-4 h-4" />}
                              {item.status === 'queued' && <Loader2 className="text-muted-foreground w-4 h-4" />}
                              {item.status === 'error' && <AlertCircle className="text-destructive w-4 h-4" />}
                            </div>
                          </div>
                      ))}
                    </div>
                 );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {files.length > 0 && (
        <CardFooter className="flex flex-col gap-2 p-0 pt-4">
            <div className='flex gap-2 w-full'>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                    <UploadCloud className="mr-2 h-4 w-4"/> Add More
                </Button>
                <Button variant="outline" onClick={onClearCompleted}>
                    <Trash2 className="mr-2 h-4 w-4"/> Clear Done
                </Button>
                 <Button variant="destructive" size="icon" onClick={onClearAll}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
             <Separator className='my-4'/>
            <div className="flex justify-center w-full">
                {/* Replace YOUR_AD_SLOT_ID with the one from your AdSense account for this ad unit */}
               <AdPlaceholder width={728} height={90} className="w-full max-w-full" adSlot="YOUR_AD_SLOT_ID" />
            </div>
        </CardFooter>
      )}
    </Card>
    </>
  );
}

    
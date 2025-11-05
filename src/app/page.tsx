"use client";

import * as React from 'react';
import { Header } from '@/components/tixel/header';
import { TilingControls } from '@/components/tixel/tiling-controls';
import { TiledPreview } from '@/components/tixel/tiled-preview';
import { BatchQueue } from '@/components/tixel/batch-queue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { Grid, Layers } from 'lucide-react';
import { suggestTilingOptions, type SuggestTilingOptionsOutput } from '@/ai/flows/suggest-tiling-options';

export type TilingOptions = {
  rows: number;
  cols: number;
};

export type BatchFile = {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
};

export default function Home() {
  const [isPremium, setIsPremium] = React.useState(false);
  const [sourceImage, setSourceImage] = React.useState<File | null>(null);
  const [tilingOptions, setTilingOptions] = React.useState<TilingOptions>({ rows: 4, cols: 4 });
  const [batchFiles, setBatchFiles] = React.useState<BatchFile[]>([]);
  const [activeTab, setActiveTab] = React.useState('single');
  const [aiSuggestions, setAiSuggestions] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const { toast } = useToast();

  const handleImageUpload = (files: File[]) => {
    if (activeTab === 'single') {
      const file = files[0];
      if (file) {
        setSourceImage(file);
        getAiSuggestions(file);
      }
    } else {
      if (!isPremium) {
        toast({
          variant: "destructive",
          title: "Premium Feature",
          description: "Batch processing is a premium feature. Please upgrade to use it.",
        });
        return;
      }
      const newBatchFiles: BatchFile[] = files.map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
        status: 'queued',
        progress: 0,
      }));
      setBatchFiles(prev => [...prev, ...newBatchFiles]);
    }
  };
  
  const getAiSuggestions = async (file: File) => {
    setIsSuggesting(true);
    setAiSuggestions([]);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const result: SuggestTilingOptionsOutput = await suggestTilingOptions({ photoDataUri: dataUri });
        setAiSuggestions(result.suggestedOptions);
      };
      reader.onerror = () => {
        throw new Error("Could not read file for AI suggestions.");
      };
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get AI suggestions.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };


  const handleUpgrade = () => {
    setIsPremium(true);
    toast({
      title: "Congratulations!",
      description: "You've unlocked all premium features.",
      className: "bg-accent text-accent-foreground border-accent",
    });
  };

  const processBatch = React.useCallback(() => {
    if (!isPremium) return;

    const filesToProcess = batchFiles.filter(f => f.status === 'queued');
    if (filesToProcess.length === 0) {
        if (batchFiles.length > 0 && batchFiles.every(f => f.status === 'completed' || f.status === 'error')) {
            toast({
                title: "Batch Complete",
                description: "All images have been processed.",
                className: "bg-accent text-accent-foreground border-accent",
            });
        }
        return;
    };

    const fileToProcess = filesToProcess[0];

    setBatchFiles(prev => prev.map(f => f.id === fileToProcess.id ? { ...f, status: 'processing' } : f));

    const interval = setInterval(() => {
        setBatchFiles(prev => {
            const currentFile = prev.find(f => f.id === fileToProcess.id);
            if (currentFile && currentFile.status === 'processing') {
                const newProgress = currentFile.progress + 20;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return prev.map(f => f.id === fileToProcess.id ? { ...f, status: 'completed', progress: 100 } : f);
                }
                return prev.map(f => f.id === fileToProcess.id ? { ...f, progress: newProgress } : f);
            }
            // If status changed elsewhere, stop this interval.
            clearInterval(interval);
            return prev;
        });
    }, 300);
  }, [batchFiles, isPremium, toast]);
  
  React.useEffect(() => {
    const isProcessing = batchFiles.some(f => f.status === 'processing');
    const hasQueue = batchFiles.some(f => f.status === 'queued');
    
    if (activeTab === 'batch' && hasQueue && !isProcessing) {
      processBatch();
    }
  }, [batchFiles, activeTab, processBatch]);

  const sourceImageUrl = sourceImage ? URL.createObjectURL(sourceImage) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header isPremium={isPremium} onUpgrade={handleUpgrade} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-0">
        <aside className="lg:col-span-1 xl:col-span-1 flex flex-col bg-card/50 lg:border-r lg:border-border/50 p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setSourceImage(null);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single"><Grid className="mr-2 h-4 w-4"/>Single Image</TabsTrigger>
              <TabsTrigger value="batch"><Layers className="mr-2 h-4 w-4"/>Batch Tiling {!isPremium && <span className="ml-2 text-xs text-primary">(Premium)</span>}</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="relative">
              <TilingControls
                onImageUpload={handleImageUpload}
                tilingOptions={tilingOptions}
                onTilingOptionsChange={setTilingOptions}
                sourceImage={sourceImage}
                aiSuggestions={aiSuggestions}
                isSuggesting={isSuggesting}
              />
            </TabsContent>
            <TabsContent value="batch">
                {!isPremium ? (
                     <div className="text-center p-8 mt-6 bg-muted/20 rounded-lg">
                        <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                        <p className="text-muted-foreground text-sm">Unlock batch processing and other powerful features to streamline your workflow.</p>
                    </div>
                ) : (
                    <BatchQueue
                        files={batchFiles}
                        onAddFiles={handleImageUpload}
                        onClearCompleted={() => setBatchFiles(files => files.filter(f => f.status !== 'completed'))}
                        onClearAll={() => setBatchFiles([])}
                    />
                )}
            </TabsContent>
          </Tabs>
        </aside>
        <section className="lg:col-span-2 xl:col-span-3 bg-black/20 p-4 flex items-center justify-center">
            <TiledPreview
                imageUrl={sourceImageUrl}
                tilingOptions={tilingOptions}
            />
        </section>
      </main>
    </div>
  );
}

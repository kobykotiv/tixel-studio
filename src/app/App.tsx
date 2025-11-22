
"use client";

import * as React from 'react';
import { Header } from '@/components/tixel/header';
import { TilingControls } from '@/components/tixel/tiling-controls';
import { TiledPreview } from '@/components/tixel/tiled-preview';
import { BatchQueue } from '@/components/tixel/batch-queue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { Grid, Layers } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdPlaceholder } from '@/components/tixel/ad-placeholder';

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

function HomePage() {
  const [sourceImage, setSourceImage] = React.useState<File | null>(null);
  const [tilingOptions, setTilingOptions] = React.useState<TilingOptions>({ rows: 4, cols: 4 });
  const [batchFiles, setBatchFiles] = React.useState<BatchFile[]>([]);
  const [activeTab, setActiveTab] = React.useState('single');

  const { toast } = useToast();

  const handleImageUpload = (files: File[]) => {
    if (activeTab === 'single') {
      const file = files[0];
      if (file) {
        setSourceImage(file);
      }
    } else {
      const newBatchFiles: BatchFile[] = files.map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
        status: 'queued',
        progress: 0,
      }));
      setBatchFiles(prev => [...prev, ...newBatchFiles]);
    }
  };

  const processBatch = React.useCallback(() => {
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
  }, [batchFiles, toast]);
  
  React.useEffect(() => {
    const isProcessing = batchFiles.some(f => f.status === 'processing');
    const hasQueue = batchFiles.some(f => f.status === 'queued');
    
    if (activeTab === 'batch' && hasQueue && !isProcessing) {
      processBatch();
    }
  }, [batchFiles, activeTab, processBatch]);

  const sourceImageUrl = sourceImage ? URL.createObjectURL(sourceImage) : null;
  const previewImageUrl = activeTab === 'single' ? sourceImageUrl : (batchFiles[0] && URL.createObjectURL(batchFiles[0].file));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-0">
        <aside className="lg:col-span-1 xl:col-span-1 flex flex-col bg-card/50 lg:border-r lg:border-border/50 p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setSourceImage(null);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single"><Grid className="mr-2 h-4 w-4"/>Single Image</TabsTrigger>
              <TabsTrigger value="batch"><Layers className="mr-2 h-4 w-4"/>Batch Tiling</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="relative">
              <TilingControls
                onImageUpload={handleImageUpload}
                tilingOptions={tilingOptions}
                onTilingOptionsChange={setTilingOptions}
                sourceImage={sourceImage}
                aiSuggestions={[]}
                isSuggesting={false}
              />
            </TabsContent>
            <TabsContent value="batch">
              <div className="space-y-6 pt-6">
                 <TilingControls
                    onImageUpload={handleImageUpload}
                    tilingOptions={tilingOptions}
                    onTilingOptionsChange={setTilingOptions}
                    sourceImage={null} // Not used in batch, but prop is required
                    aiSuggestions={[]}
                    isSuggesting={false}
                    isBatchMode={true}
                    onDownload={() => {}} // Not used in batch controls
                  />
                  <BatchQueue
                      files={batchFiles}
                      onAddFiles={handleImageUpload}
                      onClearCompleted={() => setBatchFiles(files => files.filter(f => f.status !== 'completed'))}
                      onClearAll={() => setBatchFiles([])}
                      tilingOptions={tilingOptions}
                  />
              </div>
            </TabsContent>
          </Tabs>
           <div className="mt-auto flex justify-center pt-6">
             <AdPlaceholder width={300} height={250} />
           </div>
        </aside>
        <section className="lg:col-span-2 xl:col-span-3 bg-black/20 p-4 flex items-center justify-center">
            <TiledPreview
                imageUrl={previewImageUrl}
                tilingOptions={tilingOptions}
            />
        </section>
      </main>
    </div>
  );
}


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  )
}

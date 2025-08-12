
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Cropper, { type Area } from 'react-easy-crop';
import { useSettings } from '@/hooks/use-settings';
import { analyzeMedicalReport } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Upload, FileText, AlertTriangle, Crop, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCroppedImg } from '@/lib/crop-image';
import { AudioPlayer } from '@/components/audio-player';

export default function ReportAnalyzerPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 5000000) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Max file size is 5MB.' });
        return;
      }
      if(!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({ variant: 'destructive', title: 'Invalid file type', description: '.jpg, .jpeg, .png and .webp files are accepted.' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageToCrop(result); // Set this first for the crop dialog
        setPreview(result); // Set this for the initial preview
        setAnalysis(null); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (imageToCrop && croppedAreaPixels) {
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setPreview(croppedImageBase64); // Update preview with cropped image
      setIsCropDialogOpen(false);
    }
  };

  const onSubmit = async () => {
    if (!preview) {
        toast({ variant: 'destructive', title: 'No Image', description: 'Please upload an image first.' });
        return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
        const result = await analyzeMedicalReport({ imageAsDataUri: preview });
      
        if (result.error || !result.analysis) {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to analyze report.' });
        } else {
            setAnalysis(result.analysis);
        }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">{t('reportAnalyzerTitle')}</CardTitle>
          <CardDescription>{t('reportAnalyzerDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!preview && (
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('clickToUpload')}</span> {t('orDragAndDrop')}</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                </label>
            )}

            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>
                    {imageToCrop && (
                        <div className="relative w-full h-full">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleCropConfirm}>
                            <Crop className="mr-2 h-4 w-4" />
                            Crop and Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {preview && (
              <div className="flex flex-col items-center space-y-4">
                <p className="font-semibold">{t('imagePreview')}</p>
                <div className="rounded-md border p-2 bg-muted/50">
                    <Image src={preview} alt="Report Preview" width={300} height={400} className="rounded-md object-contain" />
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => setIsCropDialogOpen(true)} variant="outline">
                        <Crop className="mr-2 h-4 w-4" /> Crop Image
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {t('analyzeReportButton')}
                    </Button>
                </div>
                 <Button onClick={() => { setPreview(null); setImageToCrop(null); }} variant="link" className="text-destructive">
                    Remove Image
                </Button>
              </div>
            )}
          </div>

          {analysis && (
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>{t('analysisResultTitle')}</CardTitle>
                        <CardDescription>{t('analysisResultDescription')}</CardDescription>
                    </div>
                </div>
                <AudioPlayer textToPlay={analysis} />
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-table:w-full prose-th:p-2 prose-td:p-2 prose-table:border prose-tr:border-b">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
              </CardContent>
              <CardFooter>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('importantDisclaimerTitle')}</AlertTitle>
                    <AlertDescription>
                        {t('reportAnalysisDisclaimer')}
                    </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

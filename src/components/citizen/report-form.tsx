'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateCivicIssueReport } from '@/ai/flows/generate-civic-issue-report';
import { generateImageFingerprint } from '@/ai/flows/generate-image-fingerprint';
import Image from 'next/image';
import { LoaderCircle, UploadCloud, X, BrainCircuit, Camera, Video, VideoOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs, doc, increment } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { DuplicateReportDialog } from './duplicate-report-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const reportSchema = z.object({
  issueType: z.string().min(1, 'Issue type is required.'),
  severity: z.enum(['Low', 'Medium', 'High']),
  aiDescription: z.string().min(1, 'Description is required.'),
  imageFile: z.instanceof(File).optional(),
  imageUrl: z.string().optional(),
  fingerprintKeywords: z.array(z.string()).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;


export function ReportForm() {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [potentialDuplicates, setPotentialDuplicates] = useState<Report[]>([]);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();


  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      issueType: '',
      severity: 'Medium',
      aiDescription: '',
      fingerprintKeywords: [],
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
        },
        () => {
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Please enable location services.',
          });
          // Fallback location for development
          const fallbackLocation = { lat: 41.8781, lng: -87.6298 };
          setLocation(fallbackLocation);
          toast({
            variant: 'default',
            title: 'Using Fallback Location',
            description: 'Using default coordinates for Chicago, USA.',
          });
        }
      );
    }
  }, [toast]);
  
  const handleTabChange = async (value: string) => {
    if (value === 'webcam') {
        // If permission not yet determined, request it
        if (hasCameraPermission === null) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions to use this feature.',
                });
            }
        }
    } else {
        // Stop camera stream when switching away from webcam tab
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  };

  const processImage = async (photoDataUri: string) => {
    if (!location || !firestore) {
      toast({
        variant: 'destructive',
        title: 'System not ready',
        description: 'Please wait for location and database services to be ready.',
      });
      return;
    }

    setIsAiLoading(true);
    form.setValue('imageUrl', photoDataUri);

    try {
      const [reportResult, fingerprintResult] = await Promise.all([
        generateCivicIssueReport({ photoDataUri, location }),
        generateImageFingerprint({ photoDataUri }),
      ]);

      form.setValue('issueType', reportResult.issueType);
      form.setValue('severity', reportResult.severity as 'Low' | 'Medium' | 'High');
      form.setValue('aiDescription', reportResult.aiDescription);
      form.setValue('fingerprintKeywords', fingerprintResult.fingerprintKeywords);

      toast({
        title: 'AI Analysis Complete',
        description: 'The issue details have been auto-filled.',
      });

      // Check for duplicates
      const reportsRef = collection(firestore, 'reports');
      const imageKeywords = fingerprintResult.fingerprintKeywords.slice(0, 10);

      if (imageKeywords.length > 0) {
        const q = query(reportsRef, where('fingerprintKeywords', 'array-contains-any', imageKeywords));
        const querySnapshot = await getDocs(q);
        const duplicates: Report[] = [];
        querySnapshot.forEach((doc) => {
          duplicates.push({ id: doc.id, ...doc.data() } as Report);
        });

        if (duplicates.length > 0) {
          setPotentialDuplicates(duplicates);
          setIsDuplicateDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('AI analysis or duplicate check failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error during processing',
        description: 'Could not analyze image. Please fill details manually.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        processImage(dataUri);
      };
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/jpeg');
            setImagePreview(dataUri);
            processImage(dataUri);
        }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('imageFile', undefined);
    form.setValue('imageUrl', '');
    form.setValue('fingerprintKeywords', []);
    form.setValue('issueType', '');
    form.setValue('severity', 'Medium');
    form.setValue('aiDescription', '');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  const proceedWithSubmission = () => {
    const data = form.getValues();
     if (!data.imageUrl || !location || !user || !firestore) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please upload an image, ensure location is available, and you are logged in.' });
        return;
    }
    
    startTransition(async () => {
        const reportData = {
            issueType: data.issueType,
            severity: data.severity,
            aiDescription: data.aiDescription,
            imageUrl: data.imageUrl,
            fingerprintKeywords: data.fingerprintKeywords,
            imageHint: 'user uploaded',
            location: location,
            userId: user.uid,
            userFullName: user.displayName || 'Anonymous',
            createdAt: new Date().toISOString(),
            status: 'Submitted' as const,
            upvoteCount: 0,
        };

        const reportsCollection = collection(firestore, 'reports');
        addDocumentNonBlocking(reportsCollection, reportData);

        toast({ title: 'Success!', description: "Report submitted successfully!" });
        router.push('/my-reports');
        router.refresh();
    });
  }
  
  const handleDuplicateConfirm = () => {
    if (!firestore || !user || potentialDuplicates.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not process duplicate confirmation.' });
        return;
    }
    
    startTransition(() => {
        const originalReport = [...potentialDuplicates].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        if (!originalReport.id) return;
        
        const reportRef = doc(firestore, 'reports', originalReport.id);
        updateDocumentNonBlocking(reportRef, {
            upvoteCount: increment(1)
        });

        const duplicateSubmissionRef = collection(firestore, 'reports', originalReport.id, 'duplicates');
        addDocumentNonBlocking(duplicateSubmissionRef, {
            userId: user.uid,
            userFullName: user.displayName || 'Anonymous',
            originalReportId: originalReport.id,
            createdAt: new Date().toISOString(),
        });

        toast({ title: 'Thank you!', description: "We've upvoted the existing report with your submission." });
        router.push('/dashboard');
        router.refresh();
    });
  };

  const onSubmit = () => {
    if (potentialDuplicates.length === 0) {
      proceedWithSubmission();
    } else {
      setIsDuplicateDialogOpen(false);
      proceedWithSubmission();
    }
  };

  return (
    <>
      <DuplicateReportDialog
        isOpen={isDuplicateDialogOpen}
        setIsOpen={setIsDuplicateDialogOpen}
        duplicates={potentialDuplicates}
        onConfirm={handleDuplicateConfirm}
        onReject={() => {
            setIsDuplicateDialogOpen(false);
            proceedWithSubmission();
        }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="w-full">
                <FormLabel>Issue Photo</FormLabel>
                 <Tabs defaultValue="upload" className="w-full mt-2" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" /> Upload Photo</TabsTrigger>
                        <TabsTrigger value="webcam"><Camera className="mr-2 h-4 w-4" /> Use Webcam</TabsTrigger>
                    </TabsList>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 relative min-h-[250px]">
                        {imagePreview && !isAiLoading && (
                            <>
                            <Image src={imagePreview} alt="Image preview" fill className="object-contain rounded-lg" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full z-10" onClick={removeImage}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove image</span>
                            </Button>
                            </>
                        )}
                        {isAiLoading && (
                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-20">
                                <BrainCircuit className="w-16 h-16 text-primary animate-pulse" />
                                <p className="mt-4 text-sm text-muted-foreground">AI is analyzing the image...</p>
                            </div>
                        )}
                        {!imagePreview && !isAiLoading && (
                            <>
                            <TabsContent value="upload" className="w-full m-0">
                                <div className="text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-600">PNG, JPG up to 1MB</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="webcam" className="w-full m-0">
                                <div className="flex flex-col items-center justify-center gap-4">
                                {hasCameraPermission === false ? (
                                    <Alert variant="destructive" className="w-full">
                                        <VideoOff className="h-4 w-4" />
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>
                                            Please allow camera access in your browser settings to use this feature.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <>
                                        <div className="w-full aspect-video bg-muted rounded-md overflow-hidden">
                                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                                        </div>
                                        <Button type="button" onClick={handleCapture} disabled={hasCameraPermission !== true}>
                                            <Camera className="mr-2 h-4 w-4" />
                                            Capture Photo
                                        </Button>
                                    </>
                                )}
                                </div>
                            </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </div>
            
            {/* Hidden canvas for capturing video frame */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            <FormField
            control={form.control}
            name="issueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Pothole, Graffiti" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aiDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="AI-generated description will appear here."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This description was generated by AI. You can edit it if needed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isAiLoading || isSubmitting || !user} className="w-full">
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Submit Report'}
          </Button>
        </form>
      </Form>
    </>
  );
}

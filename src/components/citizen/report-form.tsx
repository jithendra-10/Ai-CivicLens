'use client';

import { useState, useEffect, useTransition } from 'react';
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
import { LoaderCircle, UploadCloud, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { DuplicateReportDialog } from './duplicate-report-dialog';

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
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Please enable location services.',
          });
          setLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    }
  }, [toast]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file);
      setImagePreview(URL.createObjectURL(file));
      
      if (!location || !firestore) {
         toast({
            variant: 'destructive',
            title: 'System not ready',
            description: 'Please wait for location and database services to be ready.',
          });
         return
      }

      setIsAiLoading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const photoDataUri = reader.result as string;
          form.setValue('imageUrl', photoDataUri);
          
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
          const q = query(reportsRef, where('fingerprintKeywords', 'array-contains-any', fingerprintResult.fingerprintKeywords.slice(0, 10)));
          const querySnapshot = await getDocs(q);
          const duplicates: Report[] = [];
          querySnapshot.forEach((doc) => {
            duplicates.push({ id: doc.id, ...doc.data() } as Report);
          });
          
          if (duplicates.length > 0) {
            setPotentialDuplicates(duplicates);
            setIsDuplicateDialogOpen(true);
          }
        };
      } catch (error) {
        console.error('AI analysis or duplicate check failed:', error);
        toast({
          variant: 'destructive',
          title: 'Error during processing',
          description: 'Could not analyze image or check for duplicates. Please fill details manually.',
        });
      } finally {
        setIsAiLoading(false);
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
        };

        const reportsCollection = collection(firestore, 'reports');
        addDocumentNonBlocking(reportsCollection, reportData);

        toast({ title: 'Success!', description: "Report submitted successfully!" });
        router.push('/my-reports');
        router.refresh();
    });
  }

  const onSubmit = () => {
    // If no duplicates were found, submit directly.
    // If duplicates were found, the dialog will be open, so this function will be called again by the dialog.
    if (potentialDuplicates.length === 0) {
      proceedWithSubmission();
    } else {
      setIsDuplicateDialogOpen(true);
    }
  };

  return (
    <>
      <DuplicateReportDialog
        isOpen={isDuplicateDialogOpen}
        setIsOpen={setIsDuplicateDialogOpen}
        duplicates={potentialDuplicates}
        onConfirm={() => {
          // In a real app, you might "upvote" the existing report.
          // For now, we'll just navigate away.
          toast({ title: 'Thank you!', description: "Your feedback on the existing report has been noted." });
          router.push('/dashboard');
        }}
        onReject={proceedWithSubmission}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="w-full">
            <FormLabel>Issue Photo</FormLabel>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 relative">
              {imagePreview && !isAiLoading && (
                <>
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </>
              )}
              {isAiLoading && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-20">
                      <LoaderCircle className="h-12 w-12 animate-spin text-primary"/>
                      <p className="mt-4 text-sm text-muted-foreground">AI is analyzing the image...</p>
                  </div>
              )}
              {!imagePreview && !isAiLoading && (
                  <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                      >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                  </div>
              )}
            </div>
          </div>

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

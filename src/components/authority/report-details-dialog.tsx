'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Report, User } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTransition, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, MapPin, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';
import { sendStatusUpdateNotification } from '@/ai/flows/send-status-update-notification';

interface ReportDetailsDialogProps {
  report: Report;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ReportDetailsDialog({
  report,
  isOpen,
  setIsOpen,
}: ReportDetailsDialogProps) {
  const [status, setStatus] = useState(report.status);
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const citizenUserRef = useMemoFirebase(
    () => (firestore && report.userId ? doc(firestore, 'users', report.userId) : null),
    [firestore, report.userId]
  );
  
  const { data: citizenUser } = useDoc<User>(citizenUserRef);

  // Reset status when a new report is viewed
  useEffect(() => {
    setStatus(report.status);
  }, [report]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResolutionPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!report.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Report ID is missing.',
      });
      return;
    }

    const statusChanged = status !== report.status;

    if (status === 'Resolved' && !resolutionPhoto && !report.resolvedImageUrl) {
      toast({
        variant: 'destructive',
        title: 'Missing Photo',
        description: 'Please upload a resolution photo to resolve this report.',
      });
      return;
    }

    startTransition(async () => {
      if (!firestore) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Firestore not available.',
        });
        return;
      }
      const reportRef = doc(firestore, 'reports', report.id);
      
      let updateData: { status: Report['status'], resolvedImageUrl?: string } = { status };

      const updateAndNotify = () => {
        updateDocumentNonBlocking(reportRef, updateData);
        toast({ title: 'Success', description: 'Report status updated.' });
        
        // Trigger notification if status changed and user has opted in
        if (statusChanged && citizenUser?.communicationPreferences?.emailOnStatusChange) {
           sendStatusUpdateNotification({
              recipientEmail: citizenUser.email,
              reportId: report.id!,
              newStatus: status,
              issueType: report.issueType
           }).then((res) => {
              console.log("Notification flow result:", res.message);
              toast({ title: 'Notification Sent', description: `An update email was sent to ${citizenUser.email}.` });
           });
        }

        setIsOpen(false);
        router.refresh();
      }

      if (resolutionPhoto) {
        // Convert image to data URI
        const reader = new FileReader();
        reader.readAsDataURL(resolutionPhoto);
        reader.onload = () => {
            const dataUri = reader.result as string;
            updateData.resolvedImageUrl = dataUri;
            updateAndNotify();
        };
        reader.onerror = (error) => {
            console.error("Error converting file to data URI:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process image file.' });
        }
      } else {
        updateAndNotify();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Report Details: {report.issueType}
          </DialogTitle>
          <DialogDescription>Report ID: {report.id}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">
                Original Report Image
              </Label>
              <div className="mt-2 relative aspect-video w-full">
                <Image
                  src={report.imageUrl}
                  alt={report.aiDescription}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Location</Label>
              <div className="flex items-center gap-4">
                <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                  Lat: {report.location.lat.toFixed(4)}, Lng:{' '}
                  {report.location.lng.toFixed(4)}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Link>
                </Button>
              </div>
            </div>
            {report.resolvedImageUrl && (
              <div>
                <Label className="text-muted-foreground">
                  Resolution Image
                </Label>
                <div className="mt-2 relative aspect-video w-full">
                  <Image
                    src={report.resolvedImageUrl}
                    alt="Resolution image"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
             {report.upvoteCount && report.upvoteCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <ThumbsUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {report.upvoteCount} other citizen(s) have also reported this issue.
                </p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Severity</Label>
              <div className="pt-1">
                <Badge>{report.severity}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">AI Description</Label>
              <p className="text-sm bg-muted/50 p-3 rounded-md">
                {report.aiDescription}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="status">Update Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Report['status'])}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {status === 'Resolved' && (
              <div className="space-y-2">
                <Label htmlFor="resolution-photo">
                  Upload Resolution Photo
                </Label>
                <Input
                  id="resolution-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a photo showing the resolved issue. This will be
                  visible to the citizen.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

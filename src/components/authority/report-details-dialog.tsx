'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Report } from '@/lib/types';
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
import { useTransition, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';


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
    const [isSubmitting, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();


    const handleSubmit = () => {
        if (!report.id) {
            toast({ variant: 'destructive', title: 'Error', description: "Report ID is missing." });
            return;
        }

        startTransition(async () => {
            if (!firestore) {
                toast({ variant: 'destructive', title: 'Error', description: "Firestore not available." });
                return;
            }
            const reportRef = doc(firestore, 'reports', report.id);
            // TODO: Handle resolution image upload to Firebase Storage
            // and get the URL to save in the document.
            updateDocumentNonBlocking(reportRef, { status });
            toast({ title: 'Success', description: "Report status updated." });
            setIsOpen(false);
            router.refresh();
        });
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Report Details: {report.issueType}
          </DialogTitle>
          <DialogDescription>
            Report ID: {report.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Original Report Image</Label>
              <div className="mt-2 relative aspect-video w-full">
                <Image
                  src={report.imageUrl}
                  alt={report.aiDescription}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            </div>
             <div className='space-y-2'>
              <Label className="text-muted-foreground">Location</Label>
              <p className="text-sm font-semibold">{report.locationName || 'Location name not available'}</p>
               <div className="flex items-center gap-4">
                <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                  Lat: {report.location.lat.toFixed(4)}, Lng: {report.location.lng.toFixed(4)}
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
                    <Label className="text-muted-foreground">Resolution Image</Label>
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
                 <Select value={status} onValueChange={(value) => setStatus(value as Report['status'])}>
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
                    <Label htmlFor="resolution-photo">Upload Resolution Photo</Label>
                    <Input id="resolution-photo" type="file" accept="image/*" />
                    <p className="text-xs text-muted-foreground">
                        Upload a photo showing the resolved issue.
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
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

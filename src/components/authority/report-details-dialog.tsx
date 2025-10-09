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
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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
            updateDocumentNonBlocking(reportRef, { status });
            toast({ title: 'Success', description: "Report status updated." });
            setIsOpen(false);
            router.refresh();
        });
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
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
                  data-ai-hint={report.imageHint}
                />
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
                        data-ai-hint={report.resolvedImageHint}
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
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <p className="text-sm">
                Lat: {report.location.lat.toFixed(4)}, Lng: {report.location.lng.toFixed(4)}
              </p>
            </div>
            <div className="space-y-2">
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
                    <Input id="resolution-photo" type="file" />
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

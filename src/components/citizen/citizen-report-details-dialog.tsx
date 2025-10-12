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
import { Button } from '../ui/button';
import { MapPin, Building, Calendar, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

interface CitizenReportDetailsDialogProps {
  report: Report;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CitizenReportDetailsDialog({
  report,
  isOpen,
  setIsOpen,
}: CitizenReportDetailsDialogProps) {
  const statusDisplay = {
    Submitted: {
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    },
    'In Progress': {
      className:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    },
    Resolved: {
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    },
  };

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
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4" /> Your Submitted Image
                </Label>
                <div className="relative aspect-video w-full">
                  <Image
                    src={report.imageUrl}
                    alt={report.aiDescription}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              </div>
              {report.status === 'Resolved' && report.resolvedImageUrl && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4" /> Authority's Resolution Image
                  </Label>
                  <div className="relative aspect-video w-full">
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
            {/* Right Column - Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="pt-1">
                  <Badge className={statusDisplay[report.status].className}>
                    {report.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Severity</Label>
                <div className="pt-1">
                  <Badge variant="secondary">{report.severity}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className='h-4 w-4' /> Date Reported
                </Label>
                <p className="text-sm pt-1">
                  {format(new Date(report.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                    <MapPin className='h-4 w-4' /> Location
                </Label>
                 <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                    Lat: {report.location.lat.toFixed(4)}, Lng: {report.location.lng.toFixed(4)}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Map
                    </Link>
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">AI Description</Label>
                <p className="text-sm bg-muted/50 p-3 rounded-md border">
                  {report.aiDescription}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

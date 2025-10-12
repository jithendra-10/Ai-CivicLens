'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Report } from '@/lib/types';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

interface DuplicateReportDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  duplicates: Report[];
  onConfirm: () => void;
  onReject: () => void;
}

export function DuplicateReportDialog({
  isOpen,
  setIsOpen,
  duplicates,
  onConfirm,
  onReject,
}: DuplicateReportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Potential Duplicates Found</DialogTitle>
          <DialogDescription>
            We found one or more existing reports that look similar to yours. Is your report about one of these issues?
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-6">
            {duplicates.map((report) => (
                <div key={report.id} className="flex gap-4 p-4 rounded-lg border">
                    <div className="relative w-32 h-24 flex-shrink-0">
                        <Image
                        src={report.imageUrl}
                        alt={report.aiDescription}
                        fill
                        className="rounded-md object-cover"
                        />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-semibold">{report.issueType}</h4>
                        <p className="text-sm text-muted-foreground">{report.aiDescription}</p>
                        <p className="text-xs text-muted-foreground">Status: <span className="font-medium">{report.status}</span></p>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-between gap-2">
            <p className="text-sm text-muted-foreground flex-1">By confirming, you help us process reports faster.</p>
          <div className='flex gap-2'>
            <Button variant="outline" onClick={onReject}>
                No, this is a new issue
            </Button>
            <Button onClick={onConfirm}>
                Yes, this is a duplicate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function SafeDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(format(new Date(dateString), 'MMM d, yyyy'));
  }, [dateString]);

  if (!formattedDate) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground">{formattedDate}</div>
  );
}

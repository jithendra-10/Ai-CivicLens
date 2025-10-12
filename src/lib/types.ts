export type Role = 'citizen' | 'authority';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  role: Role;
  photoURL?: string;
  createdAt: string; // ISO string
}

export type Report = {
  id?: string;
  reportId: string;
  userId: string;
  userFullName: string;
  imageUrl: string;
  imageHint: string;
  imageFingerprint?: string; // New field for duplicate detection
  issueType: string;
  severity: 'Low' | 'Medium' | 'High';
  aiDescription: string;
  status: 'Submitted' | 'In Progress' | 'Resolved';
  authorityId?: string;
  resolvedImageUrl?: string;
  resolvedImageHint?: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: string; // ISO string
};

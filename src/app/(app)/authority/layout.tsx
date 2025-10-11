'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import Loading from '@/app/loading';

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );

  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !isAppUserLoading && appUser) {
      if (appUser.role !== 'authority') {
        // If not an authority, redirect to the citizen dashboard
        router.replace('/dashboard');
      }
    }
  }, [appUser, isUserLoading, isAppUserLoading, router]);

  // While checking the role, show a loading screen
  if (isUserLoading || isAppUserLoading || !appUser || appUser.role !== 'authority') {
    return <Loading />;
  }

  // If the user is an authority, render the requested page
  return <>{children}</>;
}

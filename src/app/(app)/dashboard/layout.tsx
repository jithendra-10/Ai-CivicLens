'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import Loading from '@/app/loading';

export default function CitizenLayout({
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
      if (appUser.role !== 'citizen') {
        // If not a citizen, redirect to the authority dashboard
        router.replace('/authority');
      }
    }
  }, [appUser, isUserLoading, isAppUserLoading, router]);

  // While checking the role, show a loading screen
  if (isUserLoading || isAppUserLoading || !appUser || appUser.role !== 'citizen') {
    return <Loading />;
  }

  // If the user is a citizen, render the requested page
  return <>{children}</>;
}

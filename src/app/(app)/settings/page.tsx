'use client';

import { ProfileForm } from '@/components/auth/profile-form';
import { PasswordChangeForm } from '@/components/auth/password-change-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import Loading from '@/app/loading';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: appUser, isLoading: isAppUserLoading } =
    useDoc<AppUser>(userDocRef);

  if (isUserLoading || isAppUserLoading || !appUser) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and profile settings.
        </p>
      </div>
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Profile</CardTitle>
            <CardDescription>
              Update your personal information. Your email address cannot be
              changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* The appUser prop is now guaranteed to be available */}
            <ProfileForm key={appUser.uid} appUser={appUser} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Change Password</CardTitle>
            <CardDescription>
              Update your account password. It's recommended to use a strong,
              unique password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

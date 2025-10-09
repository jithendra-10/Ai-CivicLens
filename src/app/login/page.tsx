'use client';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  const handleCitizenLogin = () => {
    initiateAnonymousSignIn(auth);
    router.push('/report');
  };

  const handleAuthorityLogin = () => {
    // For now, we'll use anonymous auth for both.
    // In a real app, this would be a proper email/password login.
    initiateAnonymousSignIn(auth);
    router.push('/dashboard');
  };


  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 bg-muted">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Logo className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-headline font-bold">CivicAI</h1>
          </Link>
          <p className="text-balance text-muted-foreground">
            Select your role to continue
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>
              Choose your user role to access the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button
                onClick={handleCitizenLogin}
                className="w-full"
              >
                Login as Citizen
              </Button>
              <Button
                variant="secondary"
                onClick={handleAuthorityLogin}
                className="w-full"
              >
                Login as Authority
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          AI-powered civic issue reporting.
        </div>
      </div>
    </div>
  );
}

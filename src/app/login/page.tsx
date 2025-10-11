'use client';

import { useState, useTransition } from 'react';
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
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, startTransition] = useTransition();

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Login Successful',
          description: "You've been successfully logged in.",
        });
        // The AppLayout will redirect based on the user's role
        // after onAuthStateChanged fires.
        router.push('/');
      } catch (error: any) {
        console.error('Login failed:', error);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description:
            error.code === 'auth/invalid-credential'
              ? 'Invalid email or password.'
              : 'An unexpected error occurred. Please try again.',
        });
      }
    });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 bg-muted">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <Link
            href="/"
            className="flex justify-center items-center gap-2 mb-4"
          >
            <Logo className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-headline font-bold">CivicAI</h1>
          </Link>
          <p className="text-balance text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>
              Use your registered email and password to login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button onClick={handleLogin} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Login'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, email);
        toast({
          title: 'Password Reset Email Sent',
          description:
            'If an account exists for this email, a reset link has been sent. Please check your inbox.',
        });
        setEmailSent(true);
      } catch (error: any) {
        console.error('Password reset failed:', error);
        // We show a generic message to avoid confirming whether an email exists in the system
        toast({
          title: 'Password Reset Email Sent',
          description:
            'If an account exists for this email, a reset link has been sent. Please check your inbox.',
        });
        setEmailSent(true);
      }
    });
  };

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center text-white">
          <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Logo className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-headline font-bold">CivicLens</h1>
          </Link>
          <p className="text-balance text-white/80">
            {emailSent
              ? 'Check your email for next steps'
              : 'Enter your email to reset your password'}
          </p>
        </div>
        <Card className="bg-background/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
              Forgot Password
            </CardTitle>
            <CardDescription>
              Don't worry, we'll send you a link to reset it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  We have sent a password reset link to{' '}
                  <span className="font-bold">{email}</span>. Please check
                  your spam folder if you don't see it.
                </p>
              </div>
            ) : (
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
                <Button
                  onClick={handleResetPassword}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-white">
          <Link href="/login" className="flex items-center justify-center gap-1 underline font-bold">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, initiateSignUp } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import Logo from '@/components/logo';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Role } from '@/lib/types';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .refine(
    (password) => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);
      const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
      return typesCount >= 2;
    },
    {
      message:
        'Password must contain at least two of the following: uppercase letters, lowercase letters, numbers, or special characters.',
    }
  );

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: passwordSchema,
  role: z.enum(['citizen', 'authority'], {
    required_error: 'Please select a role.',
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: data.fullName,
        });

        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: 'Registration Successful',
          description: "You can now log in with your credentials.",
        });
        router.push('/login');

      } catch (error: any) {
        console.error('Registration failed:', error);
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description:
            error.code === 'auth/email-already-in-use'
              ? 'This email is already registered.'
              : 'An unexpected error occurred. Please try again.',
        });
      }
    });
  };

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 mx-auto grid w-[400px] gap-6">
        <div className="grid gap-2 text-center text-white">
          <Link
            href="/"
            className="flex justify-center items-center gap-2 mb-4"
          >
            <Logo className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-headline font-bold">CivicLens</h1>
          </Link>
          <p className="text-balance text-white/80">
            Create an account to start reporting or managing civic issues.
          </p>
        </div>
        <Card className="bg-background/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Register</CardTitle>
            <CardDescription>
              Fill out the form below to create your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                         <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                            disabled={isSubmitting}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        8+ characters with at least two of: letters, numbers, special characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a...</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="citizen">Citizen</SelectItem>
                          <SelectItem value="authority">Authority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-white">
          Already have an account?{' '}
          <Link href="/login" className="underline font-bold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .refine(
    (password) => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);
      return [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length >= 2;
    },
    'Password must contain at least 2 of: uppercase, lowercase, number, or special character.'
  );

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordChangeForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to change your password.',
      });
      return;
    }

    startTransition(async () => {
      try {
        // Re-authenticate the user first
        const credential = EmailAuthProvider.credential(
          user.email!,
          data.currentPassword
        );
        await reauthenticateWithCredential(user, credential);

        // If re-authentication is successful, update the password
        await updatePassword(user, data.newPassword);

        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully changed.',
        });
        form.reset();
      } catch (error: any) {
        console.error('Password update failed:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description:
            error.code === 'auth/wrong-password'
              ? 'The current password you entered is incorrect.'
              : 'Could not update your password. Please try again.',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...field}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    {...field}
                    disabled={isSubmitting}
                     className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...field}
                    disabled={isSubmitting}
                     className="pr-10"
                  />
                   <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="mr-2 animate-spin" />}
          Change Password
        </Button>
      </form>
    </Form>
  );
}

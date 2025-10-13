'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  useUser,
  useAuth,
  useFirestore,
  setDocumentNonBlocking,
} from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, User as UserIcon, Camera } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '@/lib/types';

const profileSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email(),
  photoURL: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      photoURL: '',
    },
    disabled: isUserLoading || !user,
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
      });
      if (user.photoURL) {
        setImagePreview(user.photoURL);
      }
    }
  }, [user, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoURL', dataUri, { shouldValidate: true });
      };
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };


  const onSubmit = (data: ProfileFormValues) => {
    if (!user || !auth.currentUser || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }

    startTransition(async () => {
      try {
        // Update Firebase Auth profile displayName
        await updateProfile(auth.currentUser!, {
          displayName: data.fullName,
        });

        // Then, update Firestore document (non-blocking)
        const userDocRef = doc(firestore, 'users', user.uid);
        const firestoreUpdates = {
            fullName: data.fullName,
            photoURL: data.photoURL,
        };
        setDocumentNonBlocking(userDocRef, firestoreUpdates, { merge: true });

        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
      } catch (error: any) {
        console.error('Profile update failed:', error);
        let description = 'Could not update your profile. Please try again.';
        if (error.code === 'auth/invalid-photo-url') {
            description = 'Upload failed. The image file might be too large. Please try a smaller image.';
        }
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: description,
        });
      }
    });
  };

  if (isUserLoading || !user) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <Skeleton className="h-20 w-20 rounded-full" />
           <div className="space-y-2">
             <Skeleton className="h-4 w-[250px]" />
             <Skeleton className="h-4 w-[200px]" />
           </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={imagePreview || user.photoURL || undefined} alt={user?.displayName || ''} />
              <AvatarFallback className="text-2xl">
                {user.displayName ? getInitials(user.displayName) : <UserIcon />}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full h-full w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-8 w-8" />
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleImageChange}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Click the image to upload a new profile picture.
            <br />
            Recommended size: 200x200px. Max size ~1MB.
          </div>
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
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
                <Input placeholder="Your email address" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="mr-2 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

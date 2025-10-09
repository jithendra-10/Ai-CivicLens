import { login } from '@/app/login/actions';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
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
              <form className="grid gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  formAction={async () => {
                    'use server';
                    await login('citizen');
                  }}
                >
                  Login as Citizen
                </Button>
                <Button
                  variant="secondary"
                  type="submit"
                  className="w-full"
                  formAction={async () => {
                    'use server';
                    await login('authority');
                  }}
                >
                  Login as Authority
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            AI-powered civic issue reporting.
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
      </div>
    </div>
  );
}

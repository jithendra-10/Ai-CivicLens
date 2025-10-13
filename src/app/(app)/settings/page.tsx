import { ProfileForm } from '@/components/auth/profile-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and profile settings.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline">My Profile</CardTitle>
          <CardDescription>
            Update your personal information. Your email address cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}

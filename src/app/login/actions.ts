'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Role } from '@/lib/types';
import { users } from '@/lib/data';
import { initiateAnonymousSignIn, initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';


export async function login(role: Role) {
  const user = users.find((u) => u.role === role);
  if (user) {
    // In a real app, you would use Firebase Auth.
    // For this demo, we're setting a cookie to simulate login.
    cookies().set('currentUser', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    if (role === 'authority') {
      redirect('/dashboard');
    } else {
      redirect('/report');
    }
  } else {
    // Handle case where user for role is not found
    console.error(`User for role "${role}" not found.`);
    redirect('/');
  }
}

export async function logout() {
  cookies().delete('currentUser');
  redirect('/');
}

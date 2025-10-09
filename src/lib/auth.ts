import { cookies } from 'next/headers';
import type { User } from './types';

export async function getCurrentUser(): Promise<User | null> {
  const userCookie = cookies().get('currentUser');
  if (userCookie) {
    try {
      const user: User = JSON.parse(userCookie.value);
      return user;
    } catch (e) {
      return null;
    }
  }
  return null;
}

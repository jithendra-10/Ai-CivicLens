'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Firestore, doc, setDoc } from 'firebase/firestore';

export async function initiateSignUp(
  auth: Auth,
  firestore: Firestore,
  email: string,
  password: string,
  fullName: string,
  role: 'citizen' | 'authority'
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await updateProfile(user, {
    displayName: fullName,
  });

  const userDocRef = doc(firestore, 'users', user.uid);
  await setDoc(userDocRef, {
    uid: user.uid,
    fullName: fullName,
    email: email,
    role: role,
    createdAt: new Date().toISOString(),
  });

  return user;
}

export async function initiateSignIn(auth: Auth, email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

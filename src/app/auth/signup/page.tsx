'use client';

import SignUpPage from '@/components/signup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface SignUpData {
  _id: string;
  name: string;
  email: string;
  password: string;
  profession: string;
  contactNumber: string;
};

const baseURL = process.env.NEXT_PUBLIC_BASE_URL
export default function Auth() {
  const [signUpData, setSignUpData] = useState<SignUpData | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (signUpData) {
      // Handle successful sign-up, e.g., redirect to login page
      router.push('/auth/login');
    }
  }, [signUpData, router]);

  const handleSignUp = async (data: SignUpData) => {
    try {
      const response = await axios.post(
        `${baseURL}/register`,
        data
      );

      if (response.status === 200) {
        router.push('/auth/login');
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <SignUpPage
          onSignUp={handleSignUp}
        />
      </div>
    </main>
  );
}
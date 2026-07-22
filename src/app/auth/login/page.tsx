'use client';

import { LoginForm } from '@/components/login-form';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface LoginData {
  email: string;
  password: string;
}

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLogin = async (data: LoginData) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${baseUrl}/login`,
        data,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        sessionStorage.setItem("token", response.data.token); // 🔥 ADD THIS
        router.push('/admin/dashboard');
      } else {
        setError(response.data.message);
      }

    } catch (error) {
      setError('Login failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    router.push('/auth/signup');
  };


  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </main>
  );
}
'use client';

import Settings from '@/components/settings';
import { useEffect, useState } from 'react';
import axios from 'axios';

export interface Account {
  _id: string;
  userid: string;
  email: string;
}

export default function SettingsPage() {
  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

  const [userid, setUserid] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  // ── Fetch logged-in user id ──────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${baseurl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserid(res.data.id);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [baseurl]);

  // ── Fetch existing saved account once we know userid ────────────────────
  useEffect(() => {
    if (userid) {
      fetchAccount();
    }
  }, [userid]);

  const fetchAccount = async () => {
    try {
      const response = await axios.get(`${baseurl}/get-user-email/${userid}`);
      const data = response.data?.data ?? response.data; // fallback if shape differs slightly
      if (data && data.email) {
        setAccount(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Save (create/update) credentials ─────────────────────────────────────
  // ── Save (create/update) credentials ─────────────────────────────────────
  const saveAccounts = async () => {
    // Fast client-side check using already-fetched account state
    if (account) {
      const err: any = new Error("Email already registered");
      err.code = "DUPLICATE_EMAIL";
      throw err;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${baseurl}/save-user-email`, {
        userid,
        email: formData.email,
        password: formData.password,
      });

      console.log('Save response:', response.data);

      await fetchAccount();
      setFormData({ email: '', password: '' });
    } catch (err: any) {
      console.error(err);

      // Backend source-of-truth check — covers cases the client-side check missed
      const status = err?.response?.status;
      const message: string = err?.response?.data?.message || err?.response?.data?.error || '';

      const isDuplicate =
        status === 409 ||
        status === 400 && /already|exist/i.test(message);

      if (isDuplicate) {
        const dupErr: any = new Error("Email already registered");
        dupErr.code = "DUPLICATE_EMAIL";
        throw dupErr;
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Delete credentials ────────────────────────────────────────────────────
  const deleteAccount = async () => {
    try {
      const response = await axios.delete(`${baseurl}/delete-user-email/${userid}`);

      if (response.data?.success) {
        setAccount(null);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <Settings
      email={formData.email}
      appKey={formData.password}
      loading={loading}
      account={account}
      onEmailChange={(value) =>
        setFormData((prev) => ({ ...prev, email: value }))
      }
      onAppKeyChange={(value) =>
        setFormData((prev) => ({ ...prev, password: value }))
      }
      onSave={saveAccounts}
      ondelete={deleteAccount}
    />
  );
}
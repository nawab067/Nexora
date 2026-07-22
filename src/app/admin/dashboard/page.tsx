'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminDashboardView from "@/components/dashboardview";

export default function AdminDashboardContainer() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [leadcount, setleadcount] = useState<string | null>(null);

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const response = await axios.get(`${baseurl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsername(response.data.email);
        setLoading(false);

      } catch (error) {
        console.log("Unauthorized");

        router.replace("/auth/login");
      }
    };

    verifyUser();
  }, [router, baseurl]);

  useEffect(() => {
    console.log("Dashboard Loaded");
  }, []);

  async function fetchleadCount() {
    try {
      const response = await axios.get(`${baseurl}/leadcount`);
      setleadcount(response.data);
    } catch (error) {
      console.log("Error fetching lead count");
    }
  }

  useEffect(() => {
    fetchleadCount();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }



  return (
    <AdminDashboardView
      username={username}
      leadcount={leadcount}

    />
  );
}
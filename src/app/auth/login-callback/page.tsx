"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const baseurl= process.env.NEXT_PUBLIC_BASE_URL
export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          router.replace("/auth/login");
          return;
        }

        const response = await fetch(
          `${baseurl}/google-login`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: data.user.email,
              name: data.user.user_metadata?.full_name,
            }),
          }
        );

        const result = await response.json();

        console.log("Google Login Response:", result);

        if (!result.success) {
          alert(result.message);
          router.replace("/auth/signup");
          return;
        }
        console.log("Before session");

        sessionStorage.setItem("token", result.token);

        sessionStorage.setItem(
          "user",
          JSON.stringify(result.user)
        );
        console.log("After session");

        router.replace("/admin/dashboard");

      } catch (err) {
        console.error(err);
        router.replace("/auth/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm rounded-xl border-none shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              Signing you in
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Just a moment while we connect your account…
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
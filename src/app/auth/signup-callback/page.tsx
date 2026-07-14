"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleSignup = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          router.replace("/auth/signup");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/google-signup",
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

        console.log("Google Signup Response:", result);

        // ✅ SAME STYLE AS LOGIN
        if (!result.success) {
          alert(result.message || "Signup failed");
          router.replace("/auth/login");
          return;
        }

        // store same way as login (IMPORTANT)
        localStorage.setItem("token", result.token || "");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: result.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name,
          })
        );

        router.replace("/admin/dashboard");
      } catch (err) {
        console.error("Signup error:", err);
        router.replace("/auth/login");
      }
    };

    handleSignup();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm rounded-xl border-none shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              Creating your account
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Just a moment while we finish setting things up…
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
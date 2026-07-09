"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

  return <p>Signing you up...</p>;
}
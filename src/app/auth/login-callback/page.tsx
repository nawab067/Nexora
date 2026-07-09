"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
          "http://localhost:8000/google-login",
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

localStorage.setItem("token", result.token);

localStorage.setItem(
  "user",
  JSON.stringify(result.user)
);

router.replace("/admin/dashboard");

      } catch (err) {
        console.error(err);
        router.replace("/auth/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Logging you in...</p>;
}
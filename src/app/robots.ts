import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",

      allow: "/",

      disallow: [
        "/admin/",
        "/auth/login",
        "/auth/signup",
        "/auth/login-callback",
        "/auth/signup-callback",
      ],
    },

    sitemap: "https://nexora-crm-ai.vercel.app/sitemap.xml",
  };
}
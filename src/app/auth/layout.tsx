import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexora CRM | Smart CRM for Growing Businesses",

  description:
    "Nexora CRM helps businesses manage leads, customers, invoices, emails, revenue, and sales from one powerful platform.",

  keywords: [
    "Nexora CRM",
    "CRM software",
    "CRM platform",
    "lead management",
    "customer management",
    "invoice management",
    "revenue tracking",
    "sales management",
  ],

  alternates: {
    canonical: "/auth",
  },

  openGraph: {
    type: "website",

    url: "https://nexora-crm-ai.vercel.app/auth",

    title: "Nexora CRM | Smart CRM for Growing Businesses",

    description:
      "Manage leads, customers, invoices, emails and revenue with Nexora CRM.",

    siteName: "Nexora CRM",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexora CRM",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
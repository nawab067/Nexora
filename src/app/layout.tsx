import type { Metadata } from "next";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://nexora-crm-ai.vercel.app"
  ),

  title: {
    default: "Nexora CRM | Smart Customer Relationship Management",
    template: "%s | Nexora CRM",
  },

  description:
    "Nexora is a modern CRM platform for managing leads, customers, invoices, emails, revenue, and business relationships.",

  applicationName: "Nexora CRM",

  keywords: [
    "CRM",
    "CRM software",
    "customer relationship management",
    "lead management",
    "customer management",
    "sales CRM",
    "invoice management",
    "revenue management",
    "email management",
    "Nexora CRM",
  ],

  authors: [
    {
      name: "Nexora",
    },
  ],

  creator: "Nexora",
  publisher: "Nexora",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",

    url: "https://nexora-crm-ai.vercel.app/",

    siteName: "Nexora CRM",

    title: "Nexora CRM | Smart Customer Relationship Management",

    description:
      "Manage leads, customers, invoices, emails and revenue with Nexora CRM.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexora CRM",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Nexora CRM | Smart Customer Relationship Management",

    description:
      "Manage leads, customers, invoices, emails and revenue with Nexora CRM.",

    images: ["/og-image.png"],
  },

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
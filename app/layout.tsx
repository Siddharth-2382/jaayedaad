import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
import { CSPostHogProvider } from "@/helper/posthog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jaayedaad",
  description: "Track all your Investments here!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <CSPostHogProvider>
        <AuthProvider>
          <body className={inter.className}>
            {children}
            <Toaster closeButton richColors position="top-center" />
          </body>
        </AuthProvider>
      </CSPostHogProvider>
    </html>
  );
}

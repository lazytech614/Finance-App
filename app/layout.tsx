import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/global/footer";
import { Header } from "@/components/global/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expanse Tracker",
  description: "Track your expanse using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Header />
          <main className="min-h-screen">
            <TooltipProvider>{children}</TooltipProvider>
          </main>
          <Toaster richColors />
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}

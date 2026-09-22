import NavWithUser from "@/components/nav-with-user";
import SignalParticlesBackground from "@/components/ui/signal-particles-background";
import TwoColumnFooter from "@/components/ui/footer";
import { Toaster } from "@/components/ui/toaster";
import { jozoServicesSeoDescription } from "@/data/services";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import Nav from "@/components/nav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jozo.com.vn"),
  title: "JOZO Biên Hòa | Box riêng tư all-in-one — Music Box, Netflix, Switch & Board Game",
  icons: {
    icon: "/images/jozo-logo-sm.png",
    apple: "/images/jozo-logo-sm.png",
    shortcut: "/images/jozo-logo-sm.png",
  },
  keywords: [
    "JOZO",
    "box riêng tư biên hòa",
    "all in one biên hòa",
    "music box biên hòa",
    "netflix biên hòa",
    "nintendo switch biên hòa",
    "board game biên hòa",
    "box riêng tư",
    "thành viên jozo",
    "order đồ ăn tablet",
    "theo dõi thời gian sử dụng",
    "không thuế không phí dịch vụ",
    "giải trí biên hòa",
  ],
  description: jozoServicesSeoDescription,
  openGraph: {
    title: "JOZO Biên Hòa | Box riêng tư all-in-one",
    description: jozoServicesSeoDescription,
    images: ["/images/jozo-thumbnail.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "98YQhoi7X-ortJRFDLt2rR7atA-SHjjNkjak8wXSjHU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground antialiased`}
      >
        <SignalParticlesBackground
          className="fixed inset-0 z-0"
          spacing={16}
          speed={0.9}
          opacity={0.78}
        />

        {/* Header */}
        <header className="relative z-[9999]">
          <Suspense fallback={<Nav currentUser={null} />}>
            <NavWithUser />
          </Suspense>
        </header>

        {/* Main */}
        <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-3 sm:px-5 md:px-8 lg:px-10 mt-24 sm:mt-28 md:mt-32 mb-6 sm:mb-8">
          {children}
        </main>

        {/* Footer */}
        <div className="relative z-0">
          <TwoColumnFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}

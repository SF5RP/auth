import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/shared/components/providers";
import { AppLayout } from "@/shared/components/appLayout";
import { ServerProvider } from "@/shared/contexts/serverContext";
import { GlobalStyles } from "./globalStyles";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "User Service",
  description: "Authentication service with Discord OAuth2",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <GlobalStyles />
        <Providers>
          <ServerProvider>
            <AppLayout>{children}</AppLayout>
          </ServerProvider>
        </Providers>
      </body>
    </html>
  );
}

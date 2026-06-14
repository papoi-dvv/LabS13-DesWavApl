import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/app/components/SessionProvider";
import FloatingNav from "@/app/components/FloatingNav";
import ThemeProvider from "@/app/components/ThemeProvider";
import PresenceHeartbeat from "@/app/components/PresenceHeartbeat";

export const metadata: Metadata = {
  title: "Next Auth App",
  description: "My Next Auth App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <ThemeProvider>
            <PresenceHeartbeat />
            <FloatingNav />
            <main>{children}</main>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fredoka, Nunito, Press_Start_2P } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex";
import { AudioProvider } from "@/lib/audio/context";
import { ThemeProvider } from "@/lib/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MusicBar } from "@/components/layout/MusicBar";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scott Forsey — Music & Art",
  description: "Music and art by Scott Forsey. A whimsical world of sound and color.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Set dark class before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var h=new Date().getHours();if(h>=20||h<6)document.documentElement.classList.add('dark');})();` }} />
      </head>
      <body
        className={`${fredoka.variable} ${nunito.variable} ${pressStart.variable} antialiased`}
      >
        <ConvexClientProvider>
          <AudioProvider>
            <ThemeProvider>
              <Header />
              <main className="min-h-screen pb-20">{children}</main>
              <Footer />
              <MusicBar />
            </ThemeProvider>
          </AudioProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

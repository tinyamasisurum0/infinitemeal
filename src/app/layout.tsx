import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Infinite Meal - Recipe Crafting Game",
  description: "A fun recipe crafting game where you can discover and create new ingredients and dishes",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon.svg' }
    ],
    apple: { url: '/favicons/apple-touch-icon.png' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fredoka.variable}>
      <head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <meta name="google-adsense-account" content="ca-pub-7832787432797508" />        
      </head>
      <body className="antialiased min-h-screen font-fredoka">
        {children}
      </body>
    </html>
  );
}

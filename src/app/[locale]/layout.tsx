import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { getMessages, getTranslations } from "next-intl/server";
import { locales } from "@/i18n";
import IntlClientProvider from "@/components/IntlClientProvider";
import Link from "next/link";

// Import global styles
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700"],
  variable: "--font-outfit",
});

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  // Await the params to get the locale
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  
  const t = await getTranslations({ locale, namespace: 'app' });
  
  return {
    title: `${t('title')} - Recipe Crafting Game`,
    description: t('description'),
    icons: {
      icon: [
        { url: '/favicons/favicon.ico' },
        { url: '/favicons/favicon.svg' }
      ],
      apple: { url: '/favicons/apple-touch-icon.png' },
    },
  };
}

// In Next.js 15, params is a Promise that needs to be awaited
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  try {
    // Await the params to get the locale
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
    
    // Try to get messages for the locale
    let messages;
    try {
      messages = await getMessages({ locale });
    } catch (e) {
      console.error(`Failed to load messages for locale ${locale}:`, e);
      // Fall back to default locale
      messages = await getMessages({ locale: 'en' });
    }

    return (
      <html lang={locale} className={`${outfit.variable} ${outfit.className}`}>
        <head>
          <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
          <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
          <link rel="manifest" href="/favicons/site.webmanifest" />
          <meta name="google-adsense-account" content="ca-pub-7832787432797508" />        
        </head>
        <body className="antialiased min-h-screen font-medium">
          <IntlClientProvider locale={locale} messages={messages}>
            {children}
          </IntlClientProvider>
          <Analytics />
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error in LocaleLayout:', error);
    // Fallback rendering with minimal content
    return (
      <html lang="en" className={`${outfit.variable} ${outfit.className}`}>
        <head>
          <title>Infinite Meal - Recipe Crafting Game</title>
        </head>
        <body className="antialiased min-h-screen font-medium">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="mb-4 font-medium">We&apos;re working to fix the issue. Please try again later.</p>
              <Link href="/" className="text-blue-500 hover:underline font-medium">Return to Home</Link>
            </div>
          </div>
        </body>
      </html>
    );
  }
} 
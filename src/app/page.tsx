import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// Make sure this page is always evaluated server-side
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This page is needed as a fallback if middleware doesn't redirect
export default function RootPage() {
  // This is a hard redirect to ensure the user gets to the default locale
  // We shouldn't normally reach this point if middleware is working correctly
  console.log('Root page fallback reached - redirecting to default locale');
  redirect(`/${defaultLocale}`);
}

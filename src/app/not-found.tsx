import Link from 'next/link';
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// Redirect to homepage in default locale when a route is not found
export default function NotFound() {
  // Redirect to default locale homepage
  redirect(`/${defaultLocale}`);
  
  // This part should never be reached due to the redirect
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href={`/${defaultLocale}`}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
} 
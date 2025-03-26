import "./globals.css";

// This is a simple passthrough layout that doesn't create any HTML structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

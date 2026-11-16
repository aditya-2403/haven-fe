import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '../components/providers/query-provider';
import AuthProvider from '../components/providers/auth-provider';
import { ToastContainer } from '../components/ui/toast-container';

export const metadata: Metadata = {
  title: 'Haven — Visitor & Access Management',
  description: 'Modern, high-integrity visitor registration, approvals, passes and access control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

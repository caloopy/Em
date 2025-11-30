import type React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Footer } from '@/components/layout/Footer'; // Added Footer import

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
      <Footer /> 
    </AppLayout>
  );
}

    import AuthProvider from '@/components/AuthProvider'; // Adjust path if necessary
    import './globals.css'; // Your global styles
    import type { Metadata } from 'next';
    import { Inter } from 'next/font/google'; // Example font

    const inter = Inter({ subsets: ['latin'] });

    export const metadata: Metadata = {
      title: 'Horizon',
      description: 'Horizon: An open-source project management alternative.',
    };

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="en">
          <body className={inter.className}>
            <AuthProvider> {/* Wrap your application with AuthProvider */}
              {children}
            </AuthProvider>
          </body>
        </html>
      );
    }
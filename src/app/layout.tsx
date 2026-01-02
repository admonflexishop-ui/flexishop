import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { StoreProvider } from '@/lib/store';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = {
  title: 'FlexiShop',
  description: 'Clon funcional de FlexiShop + admin + WhatsApp'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

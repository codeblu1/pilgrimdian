import { Inter } from 'next/font/google';
import PayPalProvider from '@/components/PayPalProvider';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Fashion Store",
  description: "Your one-stop clothing shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </body>
    </html>
  );
}

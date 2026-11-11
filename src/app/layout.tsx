import type { Metadata } from 'next';
import { instrumentSerif, interTight } from './fonts';
import { brandConfig } from '@/lib/brand.config';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { Preloader } from '@/components/Preloader';
import { CustomCursor } from '@/components/CustomCursor';
import { Navbar } from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: brandConfig.brand.name,
  description: brandConfig.brand.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#EDE8DF] focus:px-4 focus:py-2 focus:text-[14px] focus:tracking-[0.04em] focus:text-[#0B0B0A]"
        >
          Skip to content
        </a>

        <SmoothScrollProvider>
          <Preloader />
          <Navbar />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </SmoothScrollProvider>
        <CustomCursor />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { clashDisplay, jetbrainsMono, satoshi } from './fonts';
import { siteConfig } from '@/config/site';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { GrainOverlay } from '@/components/GrainOverlay';
import { CustomCursor } from '@/components/CustomCursor';
import { Preloader } from '@/components/Preloader';
import { Navbar } from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
  description: siteConfig.brand.description,
};

const motionFlagScript = `document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion');`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlagScript }} />
      </head>
      <body className="bg-[#0A0A0A] text-[#F2F0EB] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#C8FF3D] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-[#0A0A0A]"
        >
          Skip to content
        </a>

        <SmoothScrollProvider>
          <GrainOverlay />
          <CustomCursor />
          <Preloader />
          <Navbar />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

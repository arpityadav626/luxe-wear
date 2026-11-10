import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';

/**
 * Self-hosted Fontshare fonts downloaded into /src/fonts.
 * To swap fonts, replace the .woff2 files in src/fonts/ and update paths below.
 */
export const clashDisplay = localFont({
  src: [
    { path: '../fonts/clash-display-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/clash-display-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/clash-display-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-clash-display',
  display: 'swap',
});

export const satoshi = localFont({
  src: [
    { path: '../fonts/satoshi-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/satoshi-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/satoshi-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

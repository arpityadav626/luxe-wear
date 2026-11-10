import localFont from 'next/font/local';

/**
 * Maximum 2 self-hosted font families for quiet-luxury restraint & zero CLS:
 * 1. Clash Display — editorial display headlines & oversized wordmarks
 * 2. Satoshi — clean neutral body copy & small tracked uppercase labels
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

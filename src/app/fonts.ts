import { Instrument_Serif, Inter_Tight } from 'next/font/google';

/**
 * Maximum 2 font families for quiet-luxury restraint & zero CLS:
 * 1. Instrument Serif — refined sentence-case editorial display & oversized wordmark
 * 2. Inter Tight — crisp neutral body copy & small labels
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

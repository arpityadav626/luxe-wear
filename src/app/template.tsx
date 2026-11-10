'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Route-level Framer Motion transition template.
 * Runs between route changes (e.g. `/` <-> `/archive/`) while honoring MotionConfig reducedMotion="user".
 */
export default function RootTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

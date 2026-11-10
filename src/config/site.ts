/**
 * CENTRAL BRAND & PRODUCT CONFIGURATION
 * ---------------------------------------------------------------------------
 * Change brand name, palette accents, typography labels, hero garment copy,
 * pinned story chapters, and asset paths here in one place.
 */

export interface StoryChapter {
  id: string;
  index: string;
  label: string;
  title: string;
  description: string;
  spec: string;
  bgColor: string;
  /** Target camera position & lookAt in R3F scene units */
  cameraPos: [number, number, number];
  lookAt: [number, number, number];
  /** Target Y rotation in radians (progresses 0 -> 2π across the 4 stages) */
  rotationY: number;
  rotationX: number;
  /** Optional 3D hotspot marker coordinate on the garment */
  hotspot: [number, number, number];
}

export const siteConfig = {
  brand: {
    name: 'LUXE WEAR',
    shortLines: ['LUXE', 'WEAR'] as const,
    tagline: 'Architectural Basics / Drop 01',
    description:
      'Minimal, high-end, futuristic streetwear and tailored basics engineered in small numbered runs.',
    season: 'AW / 26 — SYSTEM 01',
    coordinates: '35.6762° N · 139.6503° E',
  },

  colors: {
    bg: '#0A0A0A',
    surface: '#121212',
    fg: '#F2F0EB',
    muted: '#8D8B86',
    line: 'rgba(242, 240, 235, 0.12)',
    // Accent choice: Electric Lime (#C8FF3D). Swap to '#9FD8FF' anytime for Ice Blue.
    accent: '#C8FF3D',
    accentInk: '#0A0A0A',
  },

  heroGarment: {
    id: 'lw-01-overshirt',
    code: 'LW-01',
    indexLabel: '01 / SILHOUETTE',
    name: 'Technical Twill Overshirt',
    subtitle: '3L Japanese nylon-wool weave. Concealed magnetic placket. Articulated sleeve.',
    price: 420,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL'] as const,
    specs: [
      { label: 'WEIGHT', value: '310 GSM' },
      { label: 'WEAVE', value: '3L TECHNICAL TWILL' },
      { label: 'HARDWARE', value: 'ANODIZED FIDLOCK' },
    ],
    /**
     * ASSET SWAP INSTRUCTIONS — 3D GARMENT MODEL
     * -----------------------------------------------------------------------
     * 1. Place your real 3D garment file at: /public/models/garment.glb
     *    (Recommended: Draco-compressed .glb under 4MB, centered at [0,0,0])
     * 2. Change `useCustomGlb` below from `false` to `true`.
     * When `false`, both Hero and Pinned Story render the built-in procedural
     * 3D tailored garment so there are zero missing-file errors out of the box.
     */
    useCustomGlb: false,
    modelPath: '/models/garment.glb',

    /**
     * ASSET SWAP INSTRUCTIONS — STATIC / FALLBACK GARMENT PHOTO
     * -----------------------------------------------------------------------
     * Replace /public/images/hero-garment.jpg with your studio garment cutout
     * (WebP/AVIF/PNG/JPG on #0A0A0A or transparent background). Used for low-power
     * fallback, reduced-motion mode, and cart preview.
     */
    fallbackImage: '/images/hero-garment.jpg',
    fallbackAlt: 'LUXE WEAR LW-01 Technical Twill Overshirt in matte obsidian black',
  },

  /**
   * SECTION 3: PINNED 360° STORY CHAPTERS
   * Adjust camera angles, rotation targets, background shifts, or copy here.
   */
  storyChapters: [
    {
      id: 'collar',
      index: '01',
      label: '01 / COLLAR',
      title: 'Architectural Stand Collar',
      description: 'Bonded two-ply neckband cut to hold vertical structure without stiffness.',
      spec: '2-PLY BONDED INTERLINING · ZERO COLLAPSE',
      bgColor: '#0D0E12',
      cameraPos: [0.48, 0.96, 1.88],
      lookAt: [0.08, 0.72, 0.02],
      rotationY: 0.35,
      rotationX: 0.06,
      hotspot: [0.16, 0.76, 0.145],
    },
    {
      id: 'hardware',
      index: '02',
      label: '02 / BUTTON & PLACKET',
      title: 'Anodized Fidlock Closure',
      description: 'Magnetic gunmetal collar snap sealing a clean concealed front storm placket.',
      spec: 'CNC ANODIZED ALLOY · BLIND PLACKET',
      bgColor: '#10120E',
      cameraPos: [-0.24, 0.62, 1.66],
      lookAt: [0.1, 0.56, 0.18],
      rotationY: Math.PI * 0.58,
      rotationX: 0.03,
      hotspot: [0, 0.64, 0.268],
    },
    {
      id: 'stitching',
      index: '03',
      label: '03 / STITCHING',
      title: 'Reinforced Seam & Bar-Tack',
      description: 'Dual-needle tonal lockstitch anchored with electric-lime bar-tack vents.',
      spec: '8 SPI CORE-SPUN THREAD · STRESS VENT',
      bgColor: '#0C0F0D',
      cameraPos: [0.7, -0.32, 1.78],
      lookAt: [0.22, -0.44, 0.14],
      rotationY: Math.PI * 1.28,
      rotationX: -0.04,
      hotspot: [0.285, -0.56, 0.204],
    },
    {
      id: 'weave',
      index: '04',
      label: '04 / FABRIC WEAVE',
      title: '310 GSM Japanese 3L Twill',
      description: 'High-density diagonal nylon-wool weave engineered for breathability and matte drape.',
      spec: '310 GSM · DWR HYDROPHOBIC FINISH',
      bgColor: '#0A0A0A',
      cameraPos: [0.82, 0.44, 1.68],
      lookAt: [0.22, 0.26, 0.1],
      rotationY: Math.PI * 2.0,
      rotationX: 0.02,
      hotspot: [0.22, 0.34, 0.258],
    },
  ] satisfies StoryChapter[],

  nav: {
    links: [
      { index: '01', label: 'Silhouette', href: '#hero', status: 'live' as const },
      { index: '02', label: 'Garment Anatomy', href: '#pinned-story', status: 'live' as const },
      { index: '03', label: 'Fabric & Craft', href: '#stage-next', status: 'upcoming' as const },
      { index: '04', label: 'Capsule Collection', href: '#stage-next', status: 'upcoming' as const },
      { index: '05', label: 'Lookbook', href: '#stage-next', status: 'upcoming' as const },
    ],
    socials: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Are.na', href: 'https://are.na' },
      { label: 'Archive', href: '#stage-next' },
    ],
  },
} as const;

export type GarmentSize = (typeof siteConfig.heroGarment.sizes)[number];

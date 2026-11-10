/**
 * CENTRAL BRAND & PRODUCT CONFIGURATION
 * ---------------------------------------------------------------------------
 * Change brand name, palette accents, typography labels, hero garment copy,
 * pinned story chapters, fabric/craft specs, capsule collection products, and asset paths here.
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

export interface ProductSwatch {
  name: string;
  hex: string;
  /** Subtle overlay tint applied over studio garment shot on swatch selection */
  tintOverlay: string;
}

export interface CollectionProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  material: string;
  price: number;
  image: string;
  alt: string;
  swatches: readonly ProductSwatch[];
}

export interface LookbookFrame {
  id: string;
  index: string;
  tag: string;
  overlayLines: readonly [string, string];
  garments: string;
  location: string;
  image: string;
  alt: string;
  layout: 'wide' | 'portrait-left' | 'portrait-right';
}

export interface BrandValueItem {
  index: string;
  title: string;
  metric: number;
  suffix: string;
  metricLabel: string;
  description: string;
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

  /**
   * SECTION 4: FABRIC / CRAFT
   * Macro textile photograph + split-text headline + 3-layer weave breakdown.
   */
  fabricCraft: {
    indexLabel: '03 / FABRIC & CRAFT',
    origin: 'MILLED IN AICHI, JAPAN',
    headlineLines: ['Woven to hold form.', 'Zero excess bulk.'],
    statementLines: [
      'Shuttle-loomed Japanese three-layer twill',
      'engineered for silent abrasion across shifting climates.',
    ],
    narrative:
      'Every bolt is woven at low tension using core-spun nylon wrapped in extra-fine merino, bonded to a breathable storm membrane, and sealed along high-stress seams.',
    // ASSET SWAP: replace /public/images/fabric-macro.jpg with macro textile campaign shoot
    macroImage: '/images/fabric-macro.jpg',
    macroAlt: 'Macro close-up of black 310 GSM 3L diagonal twill weave and flatlock seam',
    macroCaption: '310 GSM · 3L DIAGONAL TWILL / 8 SPI FLATLOCK',
    layers: [
      {
        index: '01',
        name: 'Outer Face · 310 GSM Twill',
        detail: 'High-twist Japanese nylon-wool warp treated with PFC-free hydrophobic finish.',
      },
      {
        index: '02',
        name: 'Core · 18K/22K Membrane',
        detail: 'Micro-porous windproof barrier permitting continuous vapor release under load.',
      },
      {
        index: '03',
        name: 'Backing · Brushed Merino Grid',
        detail: 'Ultralight skin-side jersey channel eliminating cling while locking warmth.',
      },
    ],
  },

  /**
   * SECTION 5: HORIZONTAL SCROLL CAPSULE COLLECTION
   * 5 core garments rendered inside the pinned desktop track / mobile swipe carousel.
   * ASSET SWAP: replace /public/images/collection-*.jpg with studio product photos.
   */
  collection: {
    indexLabel: '04 / CAPSULE COLLECTION',
    tagline: 'DROP 01 — ARCHITECTURAL SYSTEMS',
    products: [
      {
        id: 'lw-01-overshirt',
        code: 'LW-01',
        name: 'Technical Twill Overshirt',
        category: 'Modular Outerwear',
        material: '310 GSM 3L Japanese Twill',
        price: 420,
        image: '/images/hero-garment.jpg',
        alt: 'LW-01 Technical Twill Overshirt in obsidian black studio view',
        swatches: [
          { name: 'Obsidian', hex: '#18191D', tintOverlay: 'transparent' },
          { name: 'Oxide Olive', hex: '#394034', tintOverlay: 'rgba(68, 88, 52, 0.28)' },
          { name: 'Mineral Ash', hex: '#63666A', tintOverlay: 'rgba(138, 145, 156, 0.24)' },
        ],
      },
      {
        id: 'lw-02-trouser',
        code: 'LW-02',
        name: 'Pleated Tailored Trouser',
        category: 'Articulated Bottom',
        material: '280 GSM Wool-Nylon Serge',
        price: 380,
        image: '/images/collection-trouser.jpg',
        alt: 'LW-02 Pleated Tailored Trouser in matte obsidian slate',
        swatches: [
          { name: 'Graphite', hex: '#23252A', tintOverlay: 'transparent' },
          { name: 'Deep Carbon', hex: '#111214', tintOverlay: 'rgba(0, 0, 0, 0.28)' },
          { name: 'Slate Fog', hex: '#545A66', tintOverlay: 'rgba(110, 128, 152, 0.26)' },
        ],
      },
      {
        id: 'lw-03-trench',
        code: 'LW-03',
        name: '3L Bonded Trench Shell',
        category: 'Weatherproof Coat',
        material: '3L Seam-Taped Storm Weave',
        price: 790,
        image: '/images/collection-trench.jpg',
        alt: 'LW-03 3L Bonded Trench Shell with funnel collar and concealed snaps',
        swatches: [
          { name: 'Obsidian', hex: '#18191D', tintOverlay: 'transparent' },
          { name: 'Moss Alloy', hex: '#2F3630', tintOverlay: 'rgba(60, 82, 62, 0.28)' },
          { name: 'Acid Rim', hex: '#88A14B', tintOverlay: 'rgba(180, 230, 75, 0.14)' },
        ],
      },
      {
        id: 'lw-04-knit',
        code: 'LW-04',
        name: 'Raglan Mock-Neck Knit',
        category: 'Thermal Knitwear',
        material: '5-Gauge Extra-Fine Merino',
        price: 340,
        image: '/images/collection-knit.jpg',
        alt: 'LW-04 Raglan Mock-Neck Knit pullover in charcoal bone slate',
        swatches: [
          { name: 'Charcoal', hex: '#2E3035', tintOverlay: 'transparent' },
          { name: 'Warm Stone', hex: '#7A766E', tintOverlay: 'rgba(214, 206, 188, 0.22)' },
          { name: 'Night', hex: '#141518', tintOverlay: 'rgba(8, 8, 12, 0.34)' },
        ],
      },
      {
        id: 'lw-05-vest',
        code: 'LW-05',
        name: 'Modular Utility Vest',
        category: 'Tactical Layering',
        material: 'Cordura-Weave Nylon + Fidlock',
        price: 460,
        image: '/images/collection-vest.jpg',
        alt: 'LW-05 Modular Utility Vest with anodized buckle and concealed zip pockets',
        swatches: [
          { name: 'Carbon', hex: '#16171B', tintOverlay: 'transparent' },
          { name: 'Titanium', hex: '#4B515B', tintOverlay: 'rgba(130, 145, 170, 0.24)' },
          { name: 'Olive', hex: '#383E32', tintOverlay: 'rgba(84, 102, 68, 0.26)' },
        ],
      },
    ] satisfies CollectionProduct[],
  },

  /**
   * SECTION 6: EDITORIAL LOOKBOOK
   * Full-bleed campaign imagery with scroll parallax, clip-path reveals,
   * and overlapping oversized display typography.
   * ASSET SWAP: replace /public/images/lookbook-*.jpg with campaign shoot frames.
   */
  lookbook: {
    indexLabel: '05 / LOOKBOOK',
    campaignTag: 'AW / 26 — EDITORIAL CAMPAIGN',
    frames: [
      {
        id: 'look-01',
        index: 'LOOK 01',
        tag: 'MONOLITH STUDY',
        overlayLines: ['SILENT', 'STRUCTURE'],
        garments: 'LW-01 Overshirt · LW-02 Pleated Trouser',
        location: 'TOKYO CONCRETE ATRIUM',
        image: '/images/lookbook-01.jpg',
        alt: 'Editorial lookbook model in obsidian 3L overshirt inside a brutalist concrete hall',
        layout: 'wide',
      },
      {
        id: 'look-02',
        index: 'LOOK 02',
        tag: 'STORM ARCHITECTURE',
        overlayLines: ['WEIGHT', 'IN MOTION'],
        garments: 'LW-03 3L Bonded Trench Shell',
        location: 'BASALT COLONNADE · DUSK',
        image: '/images/lookbook-02.jpg',
        alt: 'Editorial portrait in full-length matte charcoal trench passing dark steel columns',
        layout: 'portrait-left',
      },
      {
        id: 'look-03',
        index: 'LOOK 03',
        tag: 'MODULAR SYSTEM',
        overlayLines: ['LAYERED', 'FORM'],
        garments: 'LW-05 Utility Vest · LW-04 Merino Knit',
        location: 'ATELIER STUDY · 19°C',
        image: '/images/lookbook-03.jpg',
        alt: 'Close campaign frame showing charcoal merino mock-neck beneath modular utility vest',
        layout: 'portrait-right',
      },
    ] satisfies LookbookFrame[],
  },

  /**
   * SECTION 7: FEATURES / VALUES
   * Three minimal pillars with animated numeric counters and line-draw rules.
   */
  values: {
    indexLabel: '06 / PRINCIPLES',
    headingLines: ['Built fewer.', 'Engineered longer.'],
    items: [
      {
        index: '01',
        title: 'Sustainable',
        metric: 94,
        suffix: '%',
        metricLabel: 'TRACEABLE CLOSED-LOOP MILL ORIGIN',
        description:
          'Certified extra-fine merino, recycled nylon filaments, and PFC-free hydrophobic membranes finished under water-recovery dyeing.',
      },
      {
        index: '02',
        title: 'Limited Drops',
        metric: 250,
        suffix: '',
        metricLabel: 'SERIALIZED UNITS PER EDITION',
        description:
          'Single-batch numbered garment runs stamped inside every interior placket. Zero overproduction and zero off-season markdowns.',
      },
      {
        index: '03',
        title: 'Made to Last',
        metric: 15,
        suffix: 'YR',
        metricLabel: 'STRUCTURAL HARDWARE & SEAM WARRANTY',
        description:
          'Dual-needle 8 SPI lockstitching, anodized alloy Fidlock closures, and complimentary structural repairs across our studio network.',
      },
    ] satisfies BrandValueItem[],
  },

  /**
   * SECTION 8: PRIVATE DROP CTA
   */
  cta: {
    indexLabel: '07 / ALLOCATION',
    headlineLines: ['Join the', 'next drop.'],
    subtitle:
      'Receive encrypted dispatch credentials 24 hours before Drop 02 opens to the public.',
    placeholder: 'ENTER YOUR EMAIL ADDRESS',
    buttonLabel: 'Request Access',
    successMessage: 'Credential queued — check your inbox ahead of Drop 02 dispatch.',
  },

  /**
   * SECTION 9: FOOTER
   */
  footer: {
    legal: '© 2026 LUXE WEAR STUDIO. ALL SYSTEMS RESERVED.',
    studios: [
      { city: 'TOKYO', address: 'Minami-Aoyama 5-Chome, Minato-ku' },
      { city: 'BERLIN', address: 'Torstrasse 112, Mitte' },
    ],
    columns: [
      {
        title: 'ARCHIVE',
        links: [
          { label: '01 · Hero Silhouette', href: '#hero' },
          { label: '02 · Garment Anatomy', href: '#pinned-story' },
          { label: '03 · Fabric & Craft', href: '#fabric-craft' },
          { label: '04 · Capsule Collection', href: '#collection' },
        ],
      },
      {
        title: 'EDITION',
        links: [
          { label: '05 · AW/26 Lookbook', href: '#lookbook' },
          { label: '06 · Brand Principles', href: '#values' },
          { label: '07 · Early Allocation', href: '#drop-cta' },
          { label: '08 · Technical Index', href: '/archive' },
        ],
      },
    ],
    contactEmail: 'atelier@luxewear.studio',
  },

  nav: {
    links: [
      { index: '01', label: 'Silhouette', href: '#hero', status: 'live' as const },
      { index: '02', label: 'Garment Anatomy', href: '#pinned-story', status: 'live' as const },
      { index: '03', label: 'Fabric & Craft', href: '#fabric-craft', status: 'live' as const },
      { index: '04', label: 'Capsule Collection', href: '#collection', status: 'live' as const },
      { index: '05', label: 'Lookbook', href: '#lookbook', status: 'live' as const },
      { index: '06', label: 'Principles', href: '#values', status: 'live' as const },
      { index: '07', label: 'Next Drop', href: '#drop-cta', status: 'live' as const },
    ],
    socials: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Are.na', href: 'https://are.na' },
      { label: 'Spec Index', href: '/archive' },
    ],
  },
} as const;

export type GarmentSize = (typeof siteConfig.heroGarment.sizes)[number];

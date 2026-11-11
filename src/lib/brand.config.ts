/**
 * CENTRAL BRAND, COPY, SEQUENCE & PRODUCT CONFIGURATION
 * ---------------------------------------------------------------------------
 * Single source of truth for brand identity, palette accent, turntable image
 * sequence settings, macro detail stages, collection items, and contact details.
 *
 * Replace placeholder images, turntable frames, email, and optional principle
 * metrics below when client production assets arrive.
 */

export interface SequenceStoryStage {
  id: string;
  label: string;
  title: string;
  description: string;
  detailNote: string;
  /** Target subtle background surface hex as scroll enters this stage */
  bgColor: string;
  /** Target scroll progress stop (0..1) inside Pinned Story */
  progressStop: number;
  /** Dedicated close-up macro image for this construction detail */
  macroImage: string;
  macroAlt: string;
}

export interface ProductSwatch {
  name: string;
  hex: string;
  tintOverlay: string;
}

export interface CapsuleProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  material: string;
  specDetail: string;
  price: number;
  image: string;
  alt: string;
  swatches: readonly ProductSwatch[];
}

export interface LookbookFrame {
  id: string;
  tag: string;
  overlayLines: readonly [string, string];
  caption: string;
  image: string;
  alt: string;
  layout: 'wide' | 'portrait-left' | 'portrait-right';
}

export interface BrandPrinciple {
  id: string;
  title: string;
  /**
   * Optional verified client metric.
   * Leave `metric: null` until verified studio data is provided — the UI
   * automatically omits the numeric readout and shows clean editorial copy only.
   */
  metric: number | null;
  suffix?: string;
  metricLabel?: string;
  description: string;
}

export const brandConfig = {
  brand: {
    name: 'LUXE WEAR',
    shortLines: ['LUXE', 'WEAR'] as const,
    tagline: 'Architectural Basics',
    description:
      'Minimal tailored essentials cut from dense matte cloth for quiet movement and longevity.',
    contactEmail: 'client-contact@luxewear.example', // CLIENT SWAP: replace with studio contact email
    copyright: '© LUXE WEAR Studio',
  },

  colors: {
    bg: '#0A0A0A',
    surface: '#121212',
    fg: '#F2F0EB',
    muted: '#9A9790',
    line: 'rgba(242, 240, 235, 0.12)',
    // Accent restrained to intentional CTA / key focus highlights.
    accent: '#C8FF3D',
    accentInk: '#0A0A0A',
  },

  /**
   * TURNTABLE IMAGE SEQUENCE + HERO CUTOUT
   * -------------------------------------------------------------------------
   * Hero displays frame 1 seamlessly so scrolling transitions directly into the
   * pinned turntable canvas.
   *
   * TO SWAP REAL CLIENT TURNTABLE FRAMES:
   *   ffmpeg -i turntable.mp4 -vf "fps=30,scale=1600:-1" public/sequence/frame_%04d.webp
   * Then update `frameCount` below to match the exact exported frame total.
   */
  sequence: {
    heroImage: '/images/hero-garment.webp',
    frameCount: 60, // PLACEHOLDER SEQUENCE COUNT: adjust when real turntable frames replace /public/sequence/frame_XXXX.webp
    pathPrefix: '/sequence/frame_',
    extension: '.webp',
    width: 900,
    height: 1125,
    heroAlt: 'LUXE WEAR technical overshirt in matte charcoal-black',
  },

  hero: {
    label: 'Edition 01',
    modelPath: '/models/hero-garment.glb', // MIT base mesh adapted in obsidian matte knit + rear #C8FF3D stitch
    title: 'Heavyweight Core Tee',
    subtitle: 'Architectural drop-shoulder cut in matte obsidian cloth.',
    hint: 'Drag 360° · Scroll',
  },

  /**
   * SECTION 3: PINNED TURNTABLE STORY + 4 SEPARATE MACRO DETAIL STAGES
   */
  storyStages: [
    {
      id: 'collar',
      label: 'Collar',
      title: 'Structured Stand Collar',
      description: 'Double-layered neckband shaped to sit cleanly upright without stiffness.',
      detailNote: 'Bonded two-ply interlining with pressed seam allowances for lasting form.',
      bgColor: '#0A0A0A',
      progressStop: 0.06,
      macroImage: '/images/detail-collar.webp', // CLIENT SWAP: macro shoot of collar construction
      macroAlt: 'Close-up macro photograph of structured black shirt stand collar',
    },
    {
      id: 'closure',
      label: 'Closure',
      title: 'Concealed Front Placket',
      description: 'Anodized magnetic hardware hidden beneath an uninterrupted front line.',
      detailNote: 'Flush-set gunmetal snap paired with a folded wind placket.',
      bgColor: '#0D0E11',
      progressStop: 0.36,
      macroImage: '/images/detail-closure.webp', // CLIENT SWAP: macro shoot of front placket & fastener
      macroAlt: 'Close-up macro photograph of concealed shirt placket and matte dark fastener',
    },
    {
      id: 'stitching',
      label: 'Stitching',
      title: 'Reinforced Seam Work',
      description: 'Dense tonal stitching anchored with a signature bar-tack stress point.',
      detailNote: 'Twin-needle lockstitching finished with contrast bar-tack reinforcement.',
      bgColor: '#0B0C0E',
      progressStop: 0.65,
      macroImage: '/images/detail-stitching.webp', // CLIENT SWAP: macro shoot of flatlock seam & bar-tack
      macroAlt: 'Close-up macro photograph of tonal garment seam with lime bar-tack stitch',
    },
    {
      id: 'weave',
      label: 'Weave',
      title: 'Dense Matte Twill',
      description: 'Close-woven matte cloth balancing wind resistance with natural drape.',
      detailNote: 'High-twist yarn weave treated with a fluorocarbon-free water-repellent finish.',
      bgColor: '#0A0A0A',
      progressStop: 0.94,
      macroImage: '/images/detail-weave.webp', // CLIENT SWAP: macro shoot of diagonal twill weave
      macroAlt: 'Close-up macro photograph of dark matte diagonal twill fabric texture',
    },
  ] satisfies SequenceStoryStage[],

  /**
   * SECTION 4: FABRIC & CRAFT
   */
  fabricCraft: {
    label: 'Cloth & Tailoring',
    headlineLines: ['Woven to hold form.', 'Zero excess bulk.'],
    statement: 'Dense matte cloth shaped for weather shifts without rigid structure.',
    detailsDrawerLabel: 'Construction Details',
    specs: [
      { label: 'Outer Face', value: 'High-density matte twill with dry handfeel' },
      { label: 'Interior', value: 'Smooth breathable backing with taped seams' },
      { label: 'Finish', value: 'Fluorocarbon-free water-repellent treatment' },
    ],
    macroImage: '/images/fabric-macro.webp', // CLIENT SWAP: campaign macro weave photograph
    macroAlt: 'Macro close-up of matte dark twill cloth and clean flatlock seam',
  },

  /**
   * SECTION 5: CAPSULE COLLECTION (Distinct photo per garment)
   */
  collection: {
    label: 'Capsule',
    heading: 'Modular Essentials.',
    subtitle: 'Interlocking silhouettes in matte cloth. Hover to add.',
    products: [
      {
        id: 'lw-01-overshirt',
        code: 'LW-01',
        name: 'Technical Overshirt',
        category: 'Outerwear',
        material: 'Dense matte twill',
        specDetail: 'Concealed magnetic placket, angled chest pocket, articulated sleeve.',
        price: 420,
        image: '/images/collection-overshirt.webp', // CLIENT SWAP: dedicated card shoot (distinct from hero)
        alt: 'Angled studio view of black technical overshirt',
        swatches: [
          { name: 'Obsidian', hex: '#18191D', tintOverlay: 'transparent' },
          { name: 'Olive', hex: '#394034', tintOverlay: 'rgba(68, 88, 52, 0.28)' },
          { name: 'Ash', hex: '#63666A', tintOverlay: 'rgba(138, 145, 156, 0.24)' },
        ],
      },
      {
        id: 'lw-02-trouser',
        code: 'LW-02',
        name: 'Pleated Trouser',
        category: 'Trousers',
        material: 'Structured wool-blend serge',
        specDetail: 'Wide architectural leg, single front pleat, concealed side adjuster.',
        price: 380,
        image: '/images/collection-trouser.webp',
        alt: 'Studio front view of wide dark pleated trouser',
        swatches: [
          { name: 'Graphite', hex: '#23252A', tintOverlay: 'transparent' },
          { name: 'Carbon', hex: '#111214', tintOverlay: 'rgba(0, 0, 0, 0.28)' },
          { name: 'Slate', hex: '#545A66', tintOverlay: 'rgba(110, 128, 152, 0.26)' },
        ],
      },
      {
        id: 'lw-03-trench',
        code: 'LW-03',
        name: 'Bonded Trench Shell',
        category: 'Coats',
        material: 'Seam-taped storm twill',
        specDetail: 'Full-length funnel collar shell with concealed storm closure.',
        price: 790,
        image: '/images/collection-trench.webp',
        alt: 'Studio view of long dark bonded trench coat',
        swatches: [
          { name: 'Obsidian', hex: '#18191D', tintOverlay: 'transparent' },
          { name: 'Moss', hex: '#2F3630', tintOverlay: 'rgba(60, 82, 62, 0.28)' },
        ],
      },
      {
        id: 'lw-04-knit',
        code: 'LW-04',
        name: 'Raglan Mock-Neck Knit',
        category: 'Knitwear',
        material: 'Fine combed merino',
        specDetail: 'Dense-gauge seamless raglan knit with structured rib collar.',
        price: 340,
        image: '/images/collection-knit.webp',
        alt: 'Studio view of dark charcoal mock-neck sweater',
        swatches: [
          { name: 'Charcoal', hex: '#2E3035', tintOverlay: 'transparent' },
          { name: 'Stone', hex: '#7A766E', tintOverlay: 'rgba(214, 206, 188, 0.22)' },
        ],
      },
      {
        id: 'lw-05-vest',
        code: 'LW-05',
        name: 'Modular Utility Vest',
        category: 'Layering',
        material: 'High-tenacity matte weave',
        specDetail: 'Bellows pockets, central magnetic buckle, clean layerable cut.',
        price: 460,
        image: '/images/collection-vest.webp',
        alt: 'Studio view of modular black utility vest',
        swatches: [
          { name: 'Carbon', hex: '#16171B', tintOverlay: 'transparent' },
          { name: 'Titanium', hex: '#4B515B', tintOverlay: 'rgba(130, 145, 170, 0.24)' },
          { name: 'Olive', hex: '#383E32', tintOverlay: 'rgba(84, 102, 68, 0.26)' },
        ],
      },
    ] satisfies CapsuleProduct[],
  },

  /**
   * SECTION 6: LOOKBOOK
   */
  lookbook: {
    label: 'Lookbook',
    frames: [
      {
        id: 'look-01',
        tag: 'Look 01',
        overlayLines: ['SILENT', 'STRUCTURE'],
        caption: 'Technical Overshirt & Pleated Trouser',
        image: '/images/lookbook-01.webp',
        alt: 'Three-quarter rear lookbook photograph in concrete skylight gallery wearing black stand-collar overshirt and wide pleated trouser',
        layout: 'wide',
      },
      {
        id: 'look-02',
        tag: 'Look 02',
        overlayLines: ['WEIGHT', 'IN MOTION'],
        caption: 'Bonded Trench Shell',
        image: '/images/lookbook-02.webp',
        alt: 'Three-quarter rear stride lookbook photograph wearing long matte charcoal funnel-collar trench coat in dark slate colonnade',
        layout: 'portrait-left',
      },
      {
        id: 'look-03',
        tag: 'Look 03',
        overlayLines: ['LAYERED', 'FORM'],
        caption: 'Modular Utility Vest over Merino Knit',
        image: '/images/lookbook-03.webp',
        alt: 'Lookbook frame highlighting layered utility vest over knit pullover',
        layout: 'portrait-right',
      },
    ] satisfies LookbookFrame[],
  },

  /**
   * SECTION 7: BRAND PRINCIPLES
   * Populate `metric` only when verified client figures exist.
   */
  values: {
    label: 'Principles',
    headingLines: ['Fewer pieces.', 'Longer wear.'],
    items: [
      {
        id: 'responsible',
        title: 'Responsible Cloth',
        metric: null, // CLIENT SWAP: e.g. 90, suffix: '%', metricLabel: 'Traceable mills'
        suffix: '%',
        metricLabel: 'Verified Material Origin',
        description: 'Selected recycled yarns and clean dye houses chosen for lower footprint.',
      },
      {
        id: 'small-runs',
        title: 'Small Releases',
        metric: null, // CLIENT SWAP: e.g. 200, suffix: '', metricLabel: 'Pieces per drop'
        suffix: '',
        metricLabel: 'Edition Size',
        description: 'Produced in measured seasonal quantities to prevent surplus stock.',
      },
      {
        id: 'longevity',
        title: 'Built to Endure',
        metric: null, // CLIENT SWAP: e.g. 10, suffix: 'YR', metricLabel: 'Repair support'
        suffix: 'YR',
        metricLabel: 'Repair Commitment',
        description: 'Reinforced seams and replaceable hardware serviced across the life of the garment.',
      },
    ] satisfies BrandPrinciple[],
  },

  /**
   * SECTION 8: DROP CTA
   */
  cta: {
    headlineLines: ['Join the', 'next drop.'],
    subtitle: 'Receive a direct note ahead of our next release.',
    placeholder: 'your@email.com',
    buttonLabel: 'Join List',
    successMessage: 'Added — we will write ahead of the next release.',
  },

  /**
   * SECTION 9: NAVIGATION & FOOTER (Strictly 4–5 clean links + 1 email)
   */
  nav: {
    links: [
      { label: 'Overview', href: '#hero' },
      { label: 'Details', href: '#pinned-story' },
      { label: 'Cloth', href: '#fabric-craft' },
      { label: 'Capsule', href: '#collection' },
      { label: 'Lookbook', href: '#lookbook' },
      { label: 'Archive Index', href: '/archive' },
    ],
  },

  footerLinks: [
    { label: 'Details', href: '#pinned-story' },
    { label: 'Cloth', href: '#fabric-craft' },
    { label: 'Capsule', href: '#collection' },
    { label: 'Lookbook', href: '#lookbook' },
    { label: 'Archive', href: '/archive' },
  ],
} as const;

export type GarmentSize = 'S' | 'M' | 'L' | 'XL';
export const GARMENT_SIZES: readonly GarmentSize[] = ['S', 'M', 'L', 'XL'];

/** Backward-compatible alias so existing imports resolve seamlessly */
export const siteConfig = brandConfig;

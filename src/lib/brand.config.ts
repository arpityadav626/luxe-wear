/**
 * CENTRAL BRAND, COPY, SEQUENCE & PRODUCT CONFIGURATION
 * ---------------------------------------------------------------------------
 * Unified around the single hero garment ("The Overshirt" / Drop 01).
 * Legacy collection, lookbook, values, craft, and footer keys are preserved
 * for the sections scheduled in the next pass.
 */

export interface SequenceStoryStage {
  id: string;
  label: string;
  title: string;
  description: string;
  detailNote: string;
  /** Subtle dark surface tone shift as scroll enters this stage */
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
}

export const brand = {
  name: 'Luxe Wear',
  piece: { name: 'The Overshirt', season: 'Drop 01' },
};

export const sequence = {
  dir: '/sequence',
  prefix: 'frame_',
  ext: 'webp',
  pad: 4,
  count: 360,
};

export const frameSrc = (n: number) =>
  `${sequence.dir}/${sequence.prefix}${String(n).padStart(sequence.pad, '0')}.${sequence.ext}`;

export const hero = {
  image: '/images/hero-garment.webp',
  hasAlpha: true,
  alt: 'The Overshirt in matte obsidian cloth',
};

export const stages: SequenceStoryStage[] = [
  {
    id: 'collar',
    label: 'Collar',
    title: 'A collar that stands on its own',
    description: 'Cut to sit upright, never stiff.',
    detailNote: 'Two-piece folded collar anchored on a structured neckband.',
    bgColor: '#0B0B0A',
    progressStop: 0.12,
    macroImage: '/images/detail-collar.webp',
    macroAlt: 'Close-up of the overshirt stand collar and matte hardware',
  },
  {
    id: 'closure',
    label: 'Placket',
    title: 'Nothing interrupts the line',
    description: 'A concealed placket keeps the front clean.',
    detailNote: 'Recessed matte hardware inside a clean vertical storm fly.',
    bgColor: '#0D0D0C',
    progressStop: 0.37,
    macroImage: '/images/detail-closure.webp',
    macroAlt: 'Close-up of the concealed storm placket and collar snap',
  },
  {
    id: 'stitching',
    label: 'Stitching',
    title: 'One signature stitch',
    description: 'Placed where the garment takes the most stress.',
    detailNote: 'Single high-tenacity bar-tack anchoring the taped rear yoke.',
    bgColor: '#0F0E0D',
    progressStop: 0.62,
    macroImage: '/images/detail-stitching.webp',
    macroAlt: 'Close-up of the signature bar-tack stitch anchoring the taped rear yoke',
  },
  {
    id: 'weave',
    label: 'Cloth',
    title: 'Dense, matte, quiet',
    description: 'A close weave with a soft, even drape.',
    detailNote: 'High-twist diagonal wool-twill woven for quiet movement.',
    bgColor: '#0B0C0C',
    progressStop: 0.87,
    macroImage: '/images/detail-weave.webp',
    macroAlt: 'Macro texture of diagonal black wool-twill weave',
  },
];

export const brandConfig = {
  brand: {
    name: brand.name,
    shortLines: ['Luxe', 'Wear'] as const,
    tagline: 'Quiet architectural basics',
    description: 'Minimal tailored essentials cut from dense matte cloth for quiet movement and longevity.',
    contactEmail: 'studio@luxewear.example',
    copyright: '© Luxe Wear Studio',
  },

  piece: brand.piece,

  colors: {
    bg: '#0B0B0A',
    bone: '#EDE8DF',
    surface: '#121210',
    fg: '#EDE8DF',
    muted: '#8A857B',
    mutedOnBone: '#6E695F',
    line: 'rgba(237, 232, 223, 0.12)',
    accent: '#B8A27A',
    accentInk: '#0B0B0A',
  },

  sequence: {
    heroImage: hero.image,
    heroHasAlpha: hero.hasAlpha,
    heroAlt: hero.alt,
    dir: sequence.dir,
    frameCount: sequence.count,
    pathPrefix: `${sequence.dir}/${sequence.prefix}`,
    extension: `.${sequence.ext}`,
    pad: sequence.pad,
    width: 900,
    height: 1125,
  },

  hero: {
    label: brand.piece.season,
    title: brand.piece.name,
    hint: 'Scroll',
  },

  storyStages: stages,

  fabricCraft: {
    label: 'Cloth & tailoring',
    headlineLines: ['Woven to hold form.', 'Zero excess bulk.'],
    statement: 'Dense matte wool twill shaped for quiet movement and shifting weather without rigid canvas.',
    macroImage: '/images/fabric-macro.webp',
    macroAlt: 'Sculpted obsidian wool-twill cloth resting across warm travertine stone',
  },

  fullBleed: {
    image: '/images/editorial-fullbleed.webp',
    alt: 'Editorial frame in minimalist concrete gallery wearing obsidian pointed-collar overshirt and wide wool trousers',
    line: 'Cut to move through quiet rooms.',
  },

  collection: {
    label: 'Capsule',
    heading: 'Modular essentials.',
    subtitle: 'Select any silhouette for sizing and details.',
    products: [
      {
        id: 'lw-01-overshirt',
        code: 'LW-01',
        name: 'Technical overshirt',
        category: 'Outerwear',
        material: 'Dense matte twill',
        specDetail: 'Concealed magnetic placket, angled flap chest pocket, articulated sleeve.',
        price: 420,
        image: '/images/collection-overshirt.webp',
        alt: 'Angled studio view of obsidian technical overshirt',
        swatches: [
          { name: 'Obsidian', hex: '#18191D', tintOverlay: 'transparent' },
        ],
      },
      {
        id: 'lw-02-trouser',
        code: 'LW-02',
        name: 'Pleated trouser',
        category: 'Trousers',
        material: 'Structured wool-blend serge',
        specDetail: 'Wide architectural leg, single front pleat, concealed side adjuster.',
        price: 380,
        image: '/images/collection-trouser.webp',
        alt: 'Studio front view of wide dark pleated trouser',
        swatches: [
          { name: 'Graphite', hex: '#23252A', tintOverlay: 'transparent' },
        ],
      },
      {
        id: 'lw-03-trench',
        code: 'LW-03',
        name: 'Bonded trench shell',
        category: 'Coats',
        material: 'Seam-taped storm twill',
        specDetail: 'Full-length funnel collar shell with concealed storm closure.',
        price: 790,
        image: '/images/collection-trench.webp',
        alt: 'Studio view of long dark bonded trench coat',
        swatches: [
          { name: 'Obsidian', hex: '#18191D', tintOverlay: 'transparent' },
        ],
      },
      {
        id: 'lw-04-knit',
        code: 'LW-04',
        name: 'Raglan mock-neck knit',
        category: 'Knitwear',
        material: 'Fine combed merino',
        specDetail: 'Dense-gauge seamless raglan knit with structured rib collar.',
        price: 340,
        image: '/images/collection-knit.webp',
        alt: 'Studio view of dark charcoal mock-neck sweater',
        swatches: [
          { name: 'Charcoal', hex: '#2E3035', tintOverlay: 'transparent' },
        ],
      },
      {
        id: 'lw-05-vest',
        code: 'LW-05',
        name: 'Modular utility vest',
        category: 'Layering',
        material: 'High-tenacity matte weave',
        specDetail: 'Bellows pockets, central magnetic buckle, clean layerable cut.',
        price: 460,
        image: '/images/collection-vest.webp',
        alt: 'Studio view of modular black utility vest',
        swatches: [
          { name: 'Carbon', hex: '#16171B', tintOverlay: 'transparent' },
        ],
      },
    ] satisfies CapsuleProduct[],
  },

  lookbook: {
    label: 'Lookbook',
    frames: [
      {
        id: 'look-01',
        tag: 'Look 01',
        overlayLines: ['Silent', 'structure'],
        caption: 'Technical overshirt & pleated trouser',
        image: '/images/lookbook-01.webp',
        alt: 'Wide concrete gallery lookbook photograph wearing obsidian pointed-collar overshirt and wide pleated trouser beside architectural pillar',
      },
      {
        id: 'look-02',
        tag: 'Look 02',
        overlayLines: ['Weight', 'in motion'],
        caption: 'Bonded trench shell',
        image: '/images/lookbook-02.webp',
        alt: 'Full-length widescreen architectural courtyard photograph wearing long matte charcoal high-funnel trench coat in stride',
      },
      {
        id: 'look-03',
        tag: 'Look 03',
        overlayLines: ['Layered', 'form'],
        caption: 'Modular utility vest over merino knit',
        image: '/images/lookbook-03.webp',
        alt: 'Widescreen concrete gallery photograph wearing modular matte-black utility vest layered over charcoal merino mock-neck knit',
      },
    ] satisfies LookbookFrame[],
  },

  cta: {
    headlineLines: ['Join the', 'next drop.'],
    subtitle: 'Receive a direct note ahead of our next release.',
    placeholder: 'your@email.com',
    buttonLabel: 'Join list',
    successMessage: 'Added — we will write ahead of the next release.',
  },

  nav: {
    links: [
      { label: 'Overview', href: '#hero' },
      { label: 'Details', href: '#pinned-story' },
      { label: 'Cloth', href: '#fabric-craft' },
      { label: 'Capsule', href: '#collection' },
      { label: 'Lookbook', href: '#lookbook' },
      { label: 'Archive index', href: '/archive' },
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

export const siteConfig = brandConfig;

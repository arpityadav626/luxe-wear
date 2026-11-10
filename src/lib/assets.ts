const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Resolves public static asset URLs cleanly across root hosting and
 * GitHub Pages subpath hosting (e.g. `/luxe-wear/sequence/frame_0001.webp`).
 */
export function assetPath(path: string): string {
  if (!path.startsWith('/')) return path;
  if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

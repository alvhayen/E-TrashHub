export const WASTE_IMAGE_MAP: Record<string, string> = {
  'botol-plastik': '/images/waste/botol-plastik.webp',
  'gelas-plastik': '/images/waste/gelas-plastik.webp',
  'kertas-kardus': '/images/waste/kertas-kardus.webp',
  'logam-kaleng': '/images/waste/logam-kaleng.webp',
  'tutup-botol': '/images/waste/tutup-botol.webp',
  'kain-tekstil': '/images/waste/kain-tekstil.webp',
};

export const WASTE_IMAGE_FALLBACK = '/images/waste/default.webp';

export function getWasteImage(slug: string) {
  return WASTE_IMAGE_MAP[slug] ?? WASTE_IMAGE_FALLBACK;
}

import type { Product } from '../types';

export const OFFICIAL_PORTAL_URL = 'https://ourlittlejoys.com/honest-report';

/**
 * Products selectable in the UI.
 *
 * Little Joys / Nutrimix is listed so users can see how lookup behaves for a real
 * product. NO real laboratory records are bundled for it: none have been manually
 * reviewed against their original source yet. Lookups for it therefore end in
 * "not found in this prototype" and point to the official portal.
 *
 * The fictional "Demo Brand" products carry the DEMO records and are never
 * attributed to any real company.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'little-joys-nutrimix',
    brand: 'Little Joys',
    name: 'Nutrimix',
    isFictional: false,
    declared: null,
  },
  {
    id: 'demo-millet-mix',
    brand: 'Demo Brand (fictional)',
    name: 'Demo Millet Mix',
    isFictional: true,
    declared: {
      ingredients: 'DEMO: fictional ingredient list — millet flour, roasted grain flour, milk powder.',
      proteinPer100g: 15,
      source: 'Fictional demonstration values. Not from any real label.',
    },
  },
  {
    id: 'demo-milk-powder',
    brand: 'Demo Brand (fictional)',
    name: 'Demo Milk Powder',
    isFictional: true,
    declared: {
      ingredients: 'DEMO: fictional ingredient list — milk powder, vegetable oil, minerals.',
      proteinPer100g: 20,
      sugarPer100g: 8,
      source: 'Fictional demonstration values. Not from any real label.',
    },
  },
];

export function getBrands(products: Product[] = PRODUCTS): string[] {
  return Array.from(new Set(products.map((p) => p.brand)));
}

export function getProductsForBrand(brand: string, products: Product[] = PRODUCTS): Product[] {
  return products.filter((p) => p.brand === brand);
}

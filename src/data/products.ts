import type { ProductItem } from '../lib/api';

const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const defaultColors = ['Black', 'White', 'Navy'];
export const FALLBACK_PRODUCT_IMAGE_URL =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80';

export const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'RBT-001',
    name: 'Raabta Signature Minimal Tee',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80',
    category: 'streetwear',
    sizes: defaultSizes,
    colors: defaultColors,
    gsmOptions: [
      { gsm: 180, price: 8.99 },
      { gsm: 210, price: 10.49 },
      { gsm: 240, price: 11.99 },
    ],
  },
  {
    id: 'RBT-002',
    name: 'Raabta Anime Panel Graphic Tee',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1000&q=80',
    category: 'anime',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Charcoal'],
    gsmOptions: [
      { gsm: 180, price: 9.49 },
      { gsm: 210, price: 10.99 },
      { gsm: 240, price: 12.49 },
    ],
  },
  {
    id: 'RBT-003',
    name: 'Raabta Oversized Sports Club Tee',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80',
    category: 'sports',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Royal Blue'],
    gsmOptions: [
      { gsm: 180, price: 9.99 },
      { gsm: 210, price: 11.49 },
      { gsm: 240, price: 12.99 },
    ],
  },
  {
    id: 'RBT-004',
    name: 'Raabta Calligraphy Core Tee',
    price: 8.79,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
    category: 'islamic',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Sand'],
    gsmOptions: [
      { gsm: 180, price: 8.79 },
      { gsm: 210, price: 10.29 },
      { gsm: 240, price: 11.79 },
    ],
  },
  {
    id: 'RBT-005',
    name: 'Raabta Lifestyle Everyday Fit Tee',
    price: 8.69,
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
    category: 'customisation',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Olive'],
    gsmOptions: [
      { gsm: 180, price: 8.69 },
      { gsm: 210, price: 10.19 },
      { gsm: 240, price: 11.69 },
    ],
  },
  {
    id: 'RBT-006',
    name: 'Raabta Tokyo Drift Graphic Tee',
    price: 9.29,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80',
    category: 'anime',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Maroon'],
    gsmOptions: [
      { gsm: 180, price: 9.29 },
      { gsm: 210, price: 10.79 },
      { gsm: 240, price: 12.29 },
    ],
  },
  {
    id: 'RBT-007',
    name: 'Raabta Monochrome Typography Tee',
    price: 8.59,
    image: 'https://images.unsplash.com/photo-1593032465171-8f3d8f4e1b76?auto=format&fit=crop&w=1000&q=80',
    category: 'streetwear',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Ash Grey'],
    gsmOptions: [
      { gsm: 180, price: 8.59 },
      { gsm: 210, price: 10.09 },
      { gsm: 240, price: 11.59 },
    ],
  },
  {
    id: 'RBT-008',
    name: 'Raabta Matchday Premium Tee',
    price: 10.29,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80',
    category: 'sports',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Red'],
    gsmOptions: [
      { gsm: 180, price: 10.29 },
      { gsm: 210, price: 11.79 },
      { gsm: 240, price: 13.29 },
    ],
  },
  {
    id: 'RBT-009',
    name: 'Raabta Eid Edition Script Tee',
    price: 9.19,
    image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1000&q=80',
    category: 'islamic',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Forest Green'],
    gsmOptions: [
      { gsm: 180, price: 9.19 },
      { gsm: 210, price: 10.69 },
      { gsm: 240, price: 12.19 },
    ],
  },
  {
    id: 'RBT-010',
    name: 'Raabta Create-Your-Print Base Tee',
    price: 8.89,
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80',
    category: 'customisation',
    sizes: defaultSizes,
    colors: ['Black', 'White', 'Beige'],
    gsmOptions: [
      { gsm: 180, price: 8.89 },
      { gsm: 210, price: 10.39 },
      { gsm: 240, price: 11.89 },
    ],
  },
];

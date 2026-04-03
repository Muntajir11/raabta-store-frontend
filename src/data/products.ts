export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  // Bewakoof-style additional properties
  brand?: string;
  mrp?: string;
  discount?: string;
  images?: string[];
  description?: string;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  reviewsCount?: number;
}

const BASE_DUMMY_PRODUCTS = [
  // Normal
  { id: 1, name: 'Essential Black Tee', price: '$25', category: 'normal', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'Minimalist Logo Tee', price: '$30', category: 'normal', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'Classic Red Accent', price: '$28', category: 'normal', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600' },
  { id: 4, name: 'Oversized Blank', price: '$35', category: 'normal', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600' },
  { id: 11, name: 'White Signature', price: '$28', category: 'normal', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { id: 12, name: 'Monochrome Pack', price: '$65', category: 'normal', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },
  { id: 13, name: 'Red Box Logo', price: '$32', category: 'normal', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600' },
  { id: 14, name: 'Vintage Wash Black', price: '$38', category: 'normal', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600' },
  { id: 15, name: 'Everyday Crewneck', price: '$45', category: 'normal', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { id: 16, name: 'Performance Tee', price: '$40', category: 'normal', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },

  // Islamic
  { id: 5, name: 'Sabr Print Tee', price: '$30', category: 'islamic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600' },
  { id: 6, name: 'Tawakkul Essential', price: '$32', category: 'islamic', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
  { id: 7, name: 'Geometric Pattern Tee', price: '$35', category: 'islamic', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600' },
  { id: 8, name: 'Arabic Calligraphy', price: '$38', category: 'islamic', image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&q=80&w=600' },
  { id: 17, name: 'Alhamdulillah Tee', price: '$30', category: 'islamic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600' },
  { id: 18, name: 'Bismillah Minimal', price: '$28', category: 'islamic', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
  { id: 19, name: 'Palestine Edition', price: '$40', category: 'islamic', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600' },
  { id: 20, name: 'Kufic Art Print', price: '$35', category: 'islamic', image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&q=80&w=600' },
  { id: 21, name: 'Dua Everyday', price: '$32', category: 'islamic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600' },
  { id: 22, name: 'Crescent Moon Tee', price: '$28', category: 'islamic', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
];

// Enrich dummy products with details for the Product Page
export const DUMMY_PRODUCTS: Product[] = BASE_DUMMY_PRODUCTS.map(product => {
  const numericPrice = parseInt(product.price.replace('$', ''));
  const fakeMrp = Math.round(numericPrice * 2.5);
  const discountPercent = Math.round(((fakeMrp - numericPrice) / fakeMrp) * 100);

  return {
    ...product,
    brand: 'I.M.J Exclusive',
    mrp: `$${fakeMrp}`,
    discount: `${discountPercent}% OFF`,
    images: [
      product.image,
      // Provide some dummy alternate images based on the main image to look like a gallery
      `${product.image}&w=601`,
      `${product.image}&w=602`,
      `${product.image}&w=603`,
    ],
    description: 'This is a premium quality garment made from 100% breathable cotton. Carefully designed for maximum comfort and an oversized, relaxed fit. Perfect for everyday wear.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#ffffff', '#4a4a4a'],
    rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // random rating between 3.5 and 5.0
    reviewsCount: Math.floor(Math.random() * 500) + 10,
  };
});
import type { ProductItem } from '../lib/api';

const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const defaultColors = ['Black', 'White', 'Navy'];
export const FALLBACK_PRODUCT_IMAGE_URL =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80';

export const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'RBT-001',
    name: 'Raabta Signature Minimal T-shirt',
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
    name: 'Raabta Anime Panel Graphic T-shirt',
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
    name: 'Raabta Oversized Sports Club T-shirt',
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
    name: 'Raabta Calligraphy Core T-shirt',
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
    name: 'Raabta Lifestyle Everyday Fit T-shirt',
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
    name: 'Raabta Tokyo Drift Graphic T-shirt',
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
    name: 'Raabta Monochrome Typography T-shirt',
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
    name: 'Raabta Matchday Premium T-shirt',
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
    name: 'Raabta Eid Edition Script T-shirt',
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
    name: 'Raabta Create-Your-Print Base T-shirt',
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

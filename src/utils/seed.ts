import type { Category, Product } from '@/types';
import { createId, generateSku } from './id';

/**
 * Generates a realistic demo dataset on first launch so the dashboard,
 * charts and tables are populated out of the box. Timestamps are spread
 * across the past few weeks to make the activity feel organic.
 */
interface SeedResult {
  categories: Category[];
  products: Product[];
}

const CATEGORY_BLUEPRINT: Array<{ name: string; description: string }> = [
  { name: 'Electronics', description: 'Phones, laptops, audio and smart devices.' },
  { name: 'Apparel', description: 'Clothing, footwear and seasonal wear.' },
  { name: 'Home & Kitchen', description: 'Cookware, appliances and home essentials.' },
  { name: 'Office Supplies', description: 'Stationery, organization and desk gear.' },
  { name: 'Sports & Outdoors', description: 'Fitness equipment and outdoor gear.' },
];

const PRODUCT_BLUEPRINT: Array<{ category: string; name: string; price: number; quantity: number }> = [
  { category: 'Electronics', name: 'Aurora Wireless Headphones', price: 189.99, quantity: 42 },
  { category: 'Electronics', name: 'Pulse Mechanical Keyboard', price: 129.0, quantity: 8 },
  { category: 'Electronics', name: 'Nimbus 4K Webcam', price: 89.5, quantity: 0 },
  { category: 'Electronics', name: 'Vertex USB-C Hub', price: 54.99, quantity: 73 },
  { category: 'Electronics', name: 'Halo Smart Speaker', price: 99.99, quantity: 5 },
  { category: 'Apparel', name: 'Merino Crew Sweater', price: 78.0, quantity: 120 },
  { category: 'Apparel', name: 'Trailblazer Running Shoes', price: 134.95, quantity: 6 },
  { category: 'Apparel', name: 'Classic Oxford Shirt', price: 49.5, quantity: 88 },
  { category: 'Apparel', name: 'Storm Waterproof Jacket', price: 199.0, quantity: 0 },
  { category: 'Home & Kitchen', name: 'Artisan Cast Iron Skillet', price: 64.0, quantity: 34 },
  { category: 'Home & Kitchen', name: 'Brew Master Coffee Grinder', price: 119.99, quantity: 9 },
  { category: 'Home & Kitchen', name: 'Lumen LED Desk Lamp', price: 39.99, quantity: 56 },
  { category: 'Home & Kitchen', name: 'Vera Ceramic Dinner Set', price: 89.0, quantity: 21 },
  { category: 'Office Supplies', name: 'Meridian Notebook (3-pack)', price: 18.5, quantity: 210 },
  { category: 'Office Supplies', name: 'Glide Rollerball Pens (12)', price: 14.99, quantity: 7 },
  { category: 'Office Supplies', name: 'Apex Standing Desk Mat', price: 72.0, quantity: 0 },
  { category: 'Sports & Outdoors', name: 'Summit Insulated Bottle', price: 32.0, quantity: 145 },
  { category: 'Sports & Outdoors', name: 'FlexCore Resistance Bands', price: 27.5, quantity: 4 },
  { category: 'Sports & Outdoors', name: 'Voyager 40L Backpack', price: 149.0, quantity: 19 },
  { category: 'Sports & Outdoors', name: 'Terra Yoga Mat Pro', price: 58.0, quantity: 63 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function buildSeedData(now = new Date()): SeedResult {
  const base = now.getTime();

  const categories: Category[] = CATEGORY_BLUEPRINT.map((blueprint, index) => ({
    id: createId('cat'),
    name: blueprint.name,
    description: blueprint.description,
    createdAt: new Date(base - (40 - index) * DAY_MS).toISOString(),
  }));

  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  const products: Product[] = PRODUCT_BLUEPRINT.map((blueprint, index) => {
    const category = categoryByName.get(blueprint.category)!;
    const createdAt = new Date(base - (30 - index) * DAY_MS).toISOString();
    const updatedAt = new Date(base - Math.floor((index % 7)) * DAY_MS).toISOString();
    return {
      id: generateSku(),
      name: blueprint.name,
      categoryId: category.id,
      categoryName: category.name,
      price: blueprint.price,
      quantity: blueprint.quantity,
      createdAt,
      updatedAt,
    };
  });

  return { categories, products };
}

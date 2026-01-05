
import { MenuItem, Category, InventoryItem } from './types';

// Helper to create variations
const v = (name: string, price: number, urduName?: string) => ({ id: name.toLowerCase().replace(/\s/g, '-'), name, price, urduName });

export const MENU_ITEMS: MenuItem[] = [
  // --- KARAHI ---
  {
    id: 'k1',
    name: 'Chicken White Karahi',
    urduName: 'چکن وائٹ کڑاہی',
    description: 'Creamy white karahi with mild spices.',
    price: 1800,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 1800, 'فل'), v('Half', 1000, 'ہاف')]
  },
  {
    id: 'k2',
    name: 'Chicken Makhni Karahi',
    urduName: 'چکن مکھنی کڑاہی',
    description: 'Rich buttery chicken karahi.',
    price: 1900,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 1900, 'فل'), v('Half', 1000, 'ہاف')]
  },
  {
    id: 'k3',
    name: 'Chicken Shinwari Special',
    urduName: 'چکن شنواری سپیشل',
    description: 'Special salted chicken karahi.',
    price: 1900,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 1900, 'فل'), v('Half', 1000, 'ہاف')]
  },
  {
    id: 'k4',
    name: 'Desi Murgh Karahi',
    urduName: 'دیسی مرغ کڑاہی',
    description: 'Organic chicken karahi traditional style.',
    price: 2400,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 2400, 'فل'), v('Half', 1250, 'ہاف')]
  },
  {
    id: 'k5',
    name: 'Mutton Makhni Karahi',
    urduName: 'مٹن مکھنی کڑاہی',
    description: 'Mutton karahi cooked in butter.',
    price: 4100,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 4100, 'فل'), v('Half', 2100, 'ہاف')]
  },
  {
    id: 'k6',
    name: 'Mutton Shinwari Special',
    urduName: 'مٹن شنواری سپیشل',
    description: 'Special salted mutton karahi.',
    price: 4100,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 4100, 'فل'), v('Half', 2100, 'ہاف')]
  },
  {
    id: 'k7',
    name: 'Mutton Karahi',
    urduName: 'مٹن کڑاہی',
    description: 'Traditional mutton karahi.',
    price: 3800,
    category: Category.KARAHI,
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 3800, 'فل'), v('Half', 1900, 'ہاف')]
  },

  // --- HANDI ---
  {
    id: 'h1',
    name: 'Chicken Boneless Handi',
    urduName: 'چکن بون لیس (فل ہانڈی)',
    description: 'Boneless chicken creamy handi.',
    price: 1800,
    category: Category.HANDI,
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 1800, 'فل'), v('Half', 900, 'ہاف')]
  },
  {
    id: 'h2',
    name: 'Chicken Achar Handi',
    urduName: 'چکن اچار ہانڈی',
    description: 'Chicken handi with pickle spices.',
    price: 1800,
    category: Category.HANDI,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 1800, 'فل'), v('Half', 900, 'ہاف')]
  },
  {
    id: 'h3',
    name: 'Beef Handi Boneless',
    urduName: 'بیف ہانڈی بون لیس',
    description: 'Boneless beef handi.',
    price: 2400,
    category: Category.HANDI,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 2400, 'فل'), v('Half', 1250, 'ہاف')]
  },

  // --- BBQ ---
  {
    id: 'b1',
    name: 'Malai Boti Fry (2 Seekh)',
    urduName: 'ملائی بوٹی فرائی (2 سیخ)',
    description: 'Creamy BBQ boti fried.',
    price: 500,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b2',
    name: 'Malai Boti Fry (4 Seekh)',
    urduName: 'ملائی بوٹی فرائی (4 سیخ)',
    description: 'Creamy BBQ boti fried.',
    price: 1000,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b3',
    name: 'Afghani Boti',
    urduName: 'افغانی بوٹی',
    description: 'Mildly spiced mutton boti.',
    price: 300,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b4',
    name: 'Chicken Tikka',
    urduName: 'چکن تکہ',
    description: 'Grilled chicken piece.',
    price: 180,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b5',
    name: 'Chicken Kabab',
    urduName: 'چکن کباب',
    description: 'Minced chicken kabab.',
    price: 140,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1701579231305-d84d1019c3c8?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b6',
    name: 'Reshmi Kabab',
    urduName: 'ریشمی کباب',
    description: 'Soft minced meat kabab.',
    price: 220,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1701579231305-d84d1019c3c8?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b7',
    name: 'Malai Boti',
    urduName: 'ملائی بوٹی',
    description: 'Creamy chicken boneless cubes.',
    price: 300,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b8',
    name: 'Kabab Fry (2 pcs)',
    urduName: '2 کباب فرائی',
    description: 'Fried Kababs.',
    price: 750,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1701579231305-d84d1019c3c8?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'b9',
    name: 'Kabab Fry (4 pcs)',
    urduName: '4 کباب فرائی',
    description: 'Fried Kababs.',
    price: 1500,
    category: Category.BBQ,
    image: 'https://images.unsplash.com/photo-1701579231305-d84d1019c3c8?auto=format&fit=crop&q=80&w=400',
    available: true
  },

  // --- FRY / ROAST ---
  {
    id: 'f1',
    name: 'Fish Fry',
    urduName: 'فش فرائی',
    description: 'Fried fish piece.',
    price: 500,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 500, 'فل'), v('Half', 300, 'ہاف')]
  },
  {
    id: 'f2',
    name: 'Chest Piece Fry',
    urduName: 'چیسٹ پیس فرائی',
    description: 'Fried chicken chest piece.',
    price: 400,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f3',
    name: 'Leg Piece Fry',
    urduName: 'لیگ پیس فرائی',
    description: 'Fried chicken leg piece.',
    price: 450,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f4',
    name: 'Red Wings',
    urduName: 'ریڈ ونگز',
    description: 'Spicy chicken wings.',
    price: 150,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f5',
    name: 'White Wings',
    urduName: 'وائٹ ونگز',
    description: 'Mild chicken wings.',
    price: 160,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f6',
    name: 'Seena Piece',
    urduName: 'سینہ پیس',
    description: 'Chicken breast piece.',
    price: 350,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f7',
    name: 'Leg Piece',
    urduName: 'لیگ پیس',
    description: 'Chicken leg piece.',
    price: 300,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f8',
    name: 'Malai Chest Piece',
    urduName: 'ملائی چیسٹ پیس',
    description: 'Creamy chicken chest piece.',
    price: 450,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'f9',
    name: 'Malai Leg Piece',
    urduName: 'ملائی لیگ پیس',
    description: 'Creamy chicken leg piece.',
    price: 400,
    category: Category.FRY,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    available: true
  },

  // --- SALAN / DISHES ---
  {
    id: 's1',
    name: 'Kadhi Pakora',
    urduName: 'کڑھی پکوڑا',
    description: 'Traditional curry with pakoras.',
    price: 180,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1547496502-ffa2264a41d9?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 180, 'فل'), v('Half', 100, 'ہاف')]
  },
  {
    id: 's2',
    name: 'Daal Mash Fry',
    urduName: 'دال ماش فرائی',
    description: 'Fried white lentils.',
    price: 250,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1547496502-ffa2264a41d9?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 250, 'فل'), v('Half', 150, 'ہاف')]
  },
  {
    id: 's3',
    name: 'Daal Chana Fry',
    urduName: 'دال چنا فرائی',
    description: 'Fried gram lentils.',
    price: 180,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1547496502-ffa2264a41d9?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 180, 'فل'), v('Half', 100, 'ہاف')]
  },
  {
    id: 's4',
    name: 'Mix Vegetable',
    urduName: 'مکس سبزی',
    description: 'Mixed seasonal vegetables.',
    price: 180,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1547496502-ffa2264a41d9?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 180, 'فل'), v('Half', 100, 'ہاف')]
  },
  {
    id: 's5',
    name: 'Jalfrezi',
    urduName: 'جلفریزی',
    description: 'Chicken Jalfrezi.',
    price: 700,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&q=80&w=400',
    available: true,
  },
  {
    id: 's6',
    name: 'Chicken Salan',
    urduName: 'چکن',
    description: 'Chicken Qorma/Salan.',
    price: 380,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 380, 'فل'), v('Half', 280, 'ہاف')]
  },
  {
    id: 's7',
    name: 'Beef Matar Qeema',
    urduName: 'بیف مٹر قیمہ',
    description: 'Minced beef with peas.',
    price: 500,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    available: true,
    variations: [v('Full', 500, 'فل'), v('Half', 300, 'ہاف')]
  },
  {
    id: 's8',
    name: 'Anda Pyaz',
    urduName: 'انڈہ پیاز',
    description: 'Egg with onions.',
    price: 100,
    category: Category.SALAN,
    image: 'https://images.unsplash.com/photo-1547496502-ffa2264a41d9?auto=format&fit=crop&q=80&w=400',
    available: true,
  },

  // --- BREAKFAST ---
  {
    id: 'bf1',
    name: 'Sada Paratha',
    urduName: 'سادہ پراٹھا',
    description: 'Plain paratha.',
    price: 60,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'bf2',
    name: 'Aloo Wala Paratha',
    urduName: 'آلو والا پراٹھا',
    description: 'Potato stuffed paratha.',
    price: 100,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'bf3',
    name: 'Anday Wala Paratha',
    urduName: 'انڈے والا پراٹھا',
    description: 'Egg paratha.',
    price: 120,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'bf4',
    name: 'Mooli Wala Paratha',
    urduName: 'مولی والا پراٹھا',
    description: 'Radish stuffed paratha.',
    price: 100,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'bf5',
    name: 'Chicken Wala Paratha',
    urduName: 'چکن والا پراٹھا',
    description: 'Chicken stuffed paratha.',
    price: 200,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },

  // --- BREAD ---
  {
    id: 'br1',
    name: 'Sada Roti',
    urduName: 'سادہ روٹی',
    description: 'Plain roti.',
    price: 15,
    category: Category.BREAD,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'br2',
    name: 'Khamiri Roti',
    urduName: 'خمیری روٹی',
    description: 'Leavened bread.',
    price: 30,
    category: Category.BREAD,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'br3',
    name: 'Roghni Naan',
    urduName: 'روغنی نان',
    description: 'Sesame naan.',
    price: 60,
    category: Category.BREAD,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'br4',
    name: 'Tandoori Paratha',
    urduName: 'تندوری پراٹھا',
    description: 'Tandoor cooked paratha.',
    price: 100,
    category: Category.BREAD,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'br5',
    name: 'Kalonji Naan',
    urduName: 'کلونجی نان',
    description: 'Nigella seed naan.',
    price: 80,
    category: Category.BREAD,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },
  {
    id: 'br6',
    name: 'Garlic Naan',
    urduName: 'گارلک نان',
    description: 'Garlic naan.',
    price: 100,
    category: Category.BREAD,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
    available: true
  },

  // --- DRINKS ---
  {
    id: 'd1',
    name: 'Gurr Wali Chai',
    urduName: 'گڑ والی چائے',
    description: 'Jaggery Tea.',
    price: 70,
    category: Category.DRINK,
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&q=80&w=400',
    available: true
  }
];

// Added missing costPrice to INITIAL_INVENTORY items to satisfy InventoryItem interface
export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv1', name: 'Chicken Meat', quantity: 50, unit: 'kg', threshold: 10, costPrice: 0 },
  { id: 'inv2', name: 'Mutton Meat', quantity: 20, unit: 'kg', threshold: 5, costPrice: 0 },
  { id: 'inv3', name: 'Beef Meat', quantity: 20, unit: 'kg', threshold: 5, costPrice: 0 },
  { id: 'inv4', name: 'Flour (Atta)', quantity: 100, unit: 'kg', threshold: 20, costPrice: 0 },
  { id: 'inv5', name: 'Cooking Oil/Ghee', quantity: 50, unit: 'L', threshold: 10, costPrice: 0 },
  { id: 'inv6', name: 'Rice', quantity: 40, unit: 'kg', threshold: 10, costPrice: 0 },
  { id: 'inv7', name: 'Vegetables Mix', quantity: 15, unit: 'kg', threshold: 3, costPrice: 0 },
  { id: 'inv8', name: 'Daal Mash', quantity: 10, unit: 'kg', threshold: 2, costPrice: 0 },
  { id: 'inv9', name: 'Daal Chana', quantity: 10, unit: 'kg', threshold: 2, costPrice: 0 },
  { id: 'inv10', name: 'Tea Leaves/Gurr', quantity: 5, unit: 'kg', threshold: 1, costPrice: 0 },
];

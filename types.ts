
export enum Category {
  KARAHI = 'Karahi',
  HANDI = 'Handi',
  BBQ = 'BBQ',
  FRY = 'Fry',
  SALAN = 'Salan',
  BREAKFAST = 'Breakfast',
  BREAD = 'Bread',
  DRINK = 'Drink'
}

export enum KitchenStation {
  MAIN_KITCHEN = 'Main Kitchen',
  BBQ_STATION = 'BBQ Station',
  DRINKS_STATION = 'Drinks Station'
}

export enum OrderType {
  DINE_IN = 'Dine-In',
  TAKEAWAY = 'Takeaway',
  DELIVERY = 'Delivery'
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
  HELD = 'Held'
}

export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
  MOBILE = 'Mobile'
}

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  CASHIER = 'Cashier',
  KITCHEN = 'Kitchen'
}

export enum TransactionType {
  PURCHASE = 'Purchase',
  SALE = 'Sale',
  ADJUSTMENT = 'Adjustment'
}

export enum ExpenseCategory {
  MEAT = 'Meat',
  VEGETABLES = 'Vegetables',
  GROCERY = 'Grocery',
  UTILITIES = 'Utilities',
  RENT = 'Rent',
  SALARY = 'Salary',
  OTHER = 'Other'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late'
}

export enum SalaryType {
  MONTHLY = 'Monthly',
  DAILY = 'Daily'
}

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_REPORTS'
  | 'MANAGE_INVENTORY'
  | 'MANAGE_MENU'
  | 'MANAGE_EXPENSES'
  | 'MANAGE_SETTINGS'
  | 'PROCESS_REFUND'
  | 'ADJUST_STOCK'
  | 'ACCESS_POS'
  | 'ACCESS_KITCHEN';

export interface Variation {
  id: string;
  name: string;
  urduName?: string;
  price: number;
}

export interface Addon {
  name: string;
  price: number;
}

export interface Ingredient {
  inventoryItemId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  urduName?: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  station?: KitchenStation;
  prepTime?: number;
  sku?: string;
  isSpicy?: boolean;
  isBestseller?: boolean;
  isVegetarian?: boolean;
  variations?: Variation[];
  addons?: Addon[];
  recipe?: Ingredient[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariation?: Variation;
  selectedAddons?: Addon[];
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  serviceChargeAmount?: number;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  kitchenNote?: string;
  cashierName?: string;
  paymentMethod?: PaymentMethod;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  threshold: number;
  quantity: number;
  costPrice: number;
}

export interface PurchaseItem {
  inventoryItemId: string;
  quantity: number;
  cost: number;
}

export interface Purchase {
  id: string;
  date: Date | string;
  supplier: string;
  items: PurchaseItem[];
  totalCost: number;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  type: TransactionType;
  quantityChange: number;
  date: Date;
  reason?: string;
  referenceId?: string;
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
  permissions: Permission[];
}

export interface SystemSettings {
  restaurantName: string;
  restaurantUrduName?: string;
  address: string;
  phone: string;
  currencySymbol: string;
  taxRate: number;
  serviceChargeRate: number;
  receiptFooter?: string;
  sync?: {
    enabled: boolean;
    dropbox: {
      accessToken: string;
    }
  }
}

export interface PrinterConfig {
  printerName: string;
  paperWidth: '58mm' | '80mm';
  autoPrint: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date | string;
  staffId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  salaryAmount: number;
  salaryType: SalaryType;
  active: boolean;
  joinDate: Date;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
}

// Fixed: Added missing NoteCategory and Note types used in NoteEditor and NoteList
export enum NoteCategory {
  GENERAL = 'General',
  RECIPES = 'Recipes',
  STAFF = 'Staff',
  INVENTORY = 'Inventory',
  TASKS = 'Tasks'
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  isFavorite: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

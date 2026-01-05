
import { 
  Order, 
  MenuItem, 
  InventoryItem, 
  Purchase, 
  StockTransaction, 
  Expense, 
  User, 
  SystemSettings, 
  PrinterConfig, 
  Customer,
  UserRole,
  Staff,
  AttendanceRecord
} from '../types';
import { MENU_ITEMS, INITIAL_INVENTORY } from '../constants';

const KEYS = {
  ORDERS: 'shinwari_pos_orders',
  MENU: 'shinwari_pos_menu',
  INVENTORY: 'shinwari_pos_inventory',
  CATEGORIES: 'shinwari_pos_categories',
  PURCHASES: 'shinwari_pos_purchases',
  TRANSACTIONS: 'shinwari_pos_transactions',
  EXPENSES: 'shinwari_pos_expenses',
  USERS: 'shinwari_pos_users',
  SETTINGS: 'shinwari_pos_settings',
  PRINTER: 'shinwari_pos_printer',
  CUSTOMERS: 'shinwari_pos_customers',
  STAFF: 'shinwari_pos_staff',
  ATTENDANCE: 'shinwari_pos_attendance'
};

const DEFAULT_USERS: User[] = [
  {
    id: 'admin',
    name: 'Master Admin',
    pin: '1234',
    role: UserRole.ADMIN,
    permissions: ['VIEW_DASHBOARD', 'VIEW_REPORTS', 'MANAGE_INVENTORY', 'MANAGE_MENU', 'MANAGE_EXPENSES', 'MANAGE_SETTINGS', 'PROCESS_REFUND', 'ADJUST_STOCK', 'ACCESS_POS', 'ACCESS_KITCHEN']
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  restaurantName: 'Subhan Khan Shinwari Dera',
  restaurantUrduName: 'سبحان خان شنواری ڈیرہ',
  address: 'Main Bypass Road, Near Terminal',
  phone: '0300-4097479',
  currencySymbol: 'Rs.',
  taxRate: 16,
  serviceChargeRate: 5,
  receiptFooter: 'Developed by Rana Rashid Rashid',
  sync: { enabled: false, dropbox: { accessToken: '' } }
};

const DEFAULT_PRINTER: PrinterConfig = {
  printerName: 'Default',
  paperWidth: '80mm',
  autoPrint: false
};

export const PersistenceService = {
  get: (key: string, fallback: any) => {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  },
  set: (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data)),

  getOrders: (): Order[] => PersistenceService.get(KEYS.ORDERS, []).map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })),
  getMenu: (): MenuItem[] => PersistenceService.get(KEYS.MENU, MENU_ITEMS),
  getInventory: (): InventoryItem[] => PersistenceService.get(KEYS.INVENTORY, INITIAL_INVENTORY),
  getCategories: (): string[] => PersistenceService.get(KEYS.CATEGORIES, ['Karahi', 'Handi', 'BBQ', 'Fry', 'Salan', 'Breakfast', 'Bread', 'Drink']),
  getPurchases: (): Purchase[] => PersistenceService.get(KEYS.PURCHASES, []),
  getTransactions: (): StockTransaction[] => PersistenceService.get(KEYS.TRANSACTIONS, []),
  getExpenses: (): Expense[] => PersistenceService.get(KEYS.EXPENSES, []),
  getUsers: (): User[] => PersistenceService.get(KEYS.USERS, DEFAULT_USERS),
  getSettings: (): SystemSettings => PersistenceService.get(KEYS.SETTINGS, DEFAULT_SETTINGS),
  getPrinterConfig: (): PrinterConfig => PersistenceService.get(KEYS.PRINTER, DEFAULT_PRINTER),
  getCustomers: (): Customer[] => PersistenceService.get(KEYS.CUSTOMERS, []),
  getStaff: (): Staff[] => PersistenceService.get(KEYS.STAFF, []),
  getAttendance: (): AttendanceRecord[] => PersistenceService.get(KEYS.ATTENDANCE, []),

  saveOrders: (data: Order[]) => PersistenceService.set(KEYS.ORDERS, data),
  saveMenu: (data: MenuItem[]) => PersistenceService.set(KEYS.MENU, data),
  saveInventory: (data: InventoryItem[]) => PersistenceService.set(KEYS.INVENTORY, data),
  saveCategories: (data: string[]) => PersistenceService.set(KEYS.CATEGORIES, data),
  savePurchases: (data: Purchase[]) => PersistenceService.set(KEYS.PURCHASES, data),
  saveTransactions: (data: StockTransaction[]) => PersistenceService.set(KEYS.TRANSACTIONS, data),
  saveExpenses: (data: Expense[]) => PersistenceService.set(KEYS.EXPENSES, data),
  saveUsers: (data: User[]) => PersistenceService.set(KEYS.USERS, data),
  saveSettings: (data: SystemSettings) => PersistenceService.set(KEYS.SETTINGS, data),
  savePrinterConfig: (data: PrinterConfig) => PersistenceService.set(KEYS.PRINTER, data),
  saveCustomers: (data: Customer[]) => PersistenceService.set(KEYS.CUSTOMERS, data),
  saveStaff: (data: Staff[]) => PersistenceService.set(KEYS.STAFF, data),
  saveAttendance: (data: AttendanceRecord[]) => PersistenceService.set(KEYS.ATTENDANCE, data),

  getNextOrderNumber: (): number => {
    const lastNum = Number(localStorage.getItem('shinwari_last_order_num') || '0');
    const nextNum = lastNum + 1;
    localStorage.setItem('shinwari_last_order_num', nextNum.toString());
    return nextNum;
  },

  peekNextOrderNumber: (): number => {
    const lastNum = Number(localStorage.getItem('shinwari_last_order_num') || '0');
    return lastNum + 1;
  },

  getAllData: () => {
    const data: any = {};
    Object.entries(KEYS).forEach(([key, val]) => {
      data[val] = JSON.parse(localStorage.getItem(val) || 'null');
    });
    return data;
  },

  saveAllData: (data: any) => {
    if (!data || typeof data !== 'object') return;
    Object.entries(data).forEach(([key, val]) => {
      if (val !== null) localStorage.setItem(key, JSON.stringify(val));
    });
  },

  createBackup: () => JSON.stringify(PersistenceService.getAllData()),
  restoreBackup: (json: string) => {
    try {
      const data = JSON.parse(json);
      PersistenceService.saveAllData(data);
      return true;
    } catch {
      return false;
    }
  },
  clearDatabase: () => {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('shinwari_last_order_num');
  }
};

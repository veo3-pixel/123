import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import POSView from './components/POSView';
import KitchenView from './components/KitchenView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import ExpenseView from './components/ExpenseView';
import ReportsView from './components/ReportsView';
import MenuView from './components/MenuView';
import SettingsView from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { 
  Order, 
  OrderStatus, 
  PaymentMethod, 
  CartItem, 
  InventoryItem, 
  MenuItem, 
  OrderType, 
  Purchase, 
  StockTransaction, 
  TransactionType, 
  Expense, 
  User, 
  Customer,
  SystemSettings,
  PrinterConfig
} from './types';
import { PersistenceService } from './services/persistenceService';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

type PrintMode = 'RECEIPT' | 'KOT';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [settings, setSettings] = useState<SystemSettings>(PersistenceService.getSettings());
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(PersistenceService.getPrinterConfig());
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'offline'>('idle');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>('RECEIPT');

  useEffect(() => {
    loadLocalData();
    const token = settings.sync?.dropbox?.accessToken?.trim();
    if(settings.sync?.enabled && token && navigator.onLine) {
      performSync('PULL');
    }
  }, []);

  const loadLocalData = () => {
    setOrders(PersistenceService.getOrders());
    setInventory(PersistenceService.getInventory());
    setMenuItems(PersistenceService.getMenu());
    setCategories(PersistenceService.getCategories());
    setPurchases(PersistenceService.getPurchases());
    setTransactions(PersistenceService.getTransactions());
    setExpenses(PersistenceService.getExpenses());
    setUsers(PersistenceService.getUsers());
    setCustomers(PersistenceService.getCustomers());
    setSettings(PersistenceService.getSettings());
    setPrinterConfig(PersistenceService.getPrinterConfig());
  };

  const performSync = async (mode: 'PUSH' | 'PULL') => {
      const token = settings.sync?.dropbox?.accessToken?.trim();
      if(!token || !navigator.onLine) return;
      
      setIsSyncing(true);
      setSyncStatus('idle');

      try {
          if (mode === 'PULL') {
              const response = await fetch('https://content.dropboxapi.com/2/files/download', {
                  method: 'POST',
                  headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Dropbox-API-Arg': JSON.stringify({ path: '/shinwari_pos_db.json' }) 
                  }
              });
              if (response.ok) {
                  const cloudData = await response.json();
                  PersistenceService.saveAllData(cloudData);
                  loadLocalData();
                  setSyncStatus('success');
              } else if (response.status === 404) {
                  // File doesn't exist yet, we'll push on first update
                  setSyncStatus('idle');
              } else {
                setSyncStatus('error');
              }
          } else if (mode === 'PUSH') {
              const allData = PersistenceService.getAllData();
              const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                  method: 'POST',
                  headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/octet-stream',
                    'Dropbox-API-Arg': JSON.stringify({ 
                      path: '/shinwari_pos_db.json', 
                      mode: 'overwrite', 
                      mute: true 
                    }) 
                  },
                  body: JSON.stringify(allData)
              });
              if (response.ok) setSyncStatus('success');
              else setSyncStatus('error');
          }
      } catch (err) { 
        console.error("Sync Failure:", err);
        setSyncStatus('error'); 
      } finally { 
        setIsSyncing(false); 
        setTimeout(() => setSyncStatus('idle'), 5000); 
      }
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    PersistenceService.saveSettings(newSettings);
    if(newSettings.sync?.enabled) performSync('PUSH');
  };

  const handleUpdatePrinter = (newConfig: PrinterConfig) => {
    setPrinterConfig(newConfig);
    PersistenceService.savePrinterConfig(newConfig);
  };

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    PersistenceService.saveUsers(newUsers);
  };

  const handlePlaceOrder = (items: CartItem[], total: number, type: OrderType, details: any, method: PaymentMethod): Order => {
    const seqNum = PersistenceService.getNextOrderNumber();
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      orderNumber: seqNum,
      type, items, total, status: OrderStatus.PENDING, timestamp: new Date(),
      paymentMethod: method, cashierName: currentUser?.name || 'Admin', ...details
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    PersistenceService.saveOrders(updated);
    setCart([]); setPreviewOrder(newOrder); setPrintMode('RECEIPT');
    if(settings.sync?.enabled) performSync('PUSH');
    return newOrder;
  };

  const handleUpdateOrder = (items: CartItem[], total: number, type: OrderType, details: any, method: PaymentMethod): Order => {
    const existing = orders.find(o => o.id === currentOrderId);
    if (!existing) throw new Error("Order not found");
    const updatedOrder = { ...existing, items, total, status: OrderStatus.PENDING, paymentMethod: method, ...details } as Order;
    const updated = orders.map(o => o.id === currentOrderId ? updatedOrder : o);
    setOrders(updated); 
    PersistenceService.saveOrders(updated); 
    setCurrentOrderId(null); 
    setCart([]); 
    setPreviewOrder(updatedOrder);
    if(settings.sync?.enabled) performSync('PUSH');
    return updatedOrder;
  };

  if (!currentUser) return <LoginView users={users} onLogin={setCurrentUser} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'pos': return <POSView settings={settings} menuItems={menuItems} cart={cart} setCart={setCart} currentOrderId={currentOrderId} customers={customers} categories={categories} onPlaceOrder={handlePlaceOrder} onUpdateOrder={handleUpdateOrder} onCancelEdit={() => setCurrentOrderId(null)} onPrintReceipt={(o) => { setPreviewOrder(o); setPrintMode('RECEIPT'); }} />;
      case 'kitchen': return <KitchenView orders={orders} updateOrderStatus={(id, s) => { const u = orders.map(o => o.id === id ? {...o, status: s} : o); setOrders(u); PersistenceService.saveOrders(u); if(settings.sync?.enabled) performSync('PUSH'); }} onEditOrder={(o) => { setCart(o.items); setCurrentOrderId(o.id); setActiveTab('pos'); }} onPrintKOT={(o) => { setPreviewOrder(o); setPrintMode('KOT'); }} />;
      case 'dashboard': return <DashboardView currentUser={currentUser} orders={orders} purchases={purchases} expenses={expenses} onPrintReceipt={(o) => { setPreviewOrder(o); setPrintMode('RECEIPT'); }} />;
      case 'menu': return <MenuView currentUser={currentUser} menuItems={menuItems} inventory={inventory} categories={categories} onUpdateMenu={(items) => { setMenuItems(items); PersistenceService.saveMenu(items); if(settings.sync?.enabled) performSync('PUSH'); }} onAddCategory={(name) => { if (!categories.includes(name)) { const n = [...categories, name]; setCategories(n); PersistenceService.saveCategories(n); if(settings.sync?.enabled) performSync('PUSH'); } }} onUpdateCategory={(old, newN) => {}} />;
      case 'inventory': return <InventoryView inventory={inventory} purchases={purchases} transactions={transactions} onAddInventoryItem={(i) => { const n = [...inventory, i]; setInventory(n); PersistenceService.saveInventory(n); if(settings.sync?.enabled) performSync('PUSH'); }} onUpdateInventoryItem={(i) => { const n = inventory.map(x => x.id === i.id ? i : x); setInventory(n); PersistenceService.saveInventory(n); if(settings.sync?.enabled) performSync('PUSH'); }} onPurchase={() => {}} onAdjustStock={() => {}} />;
      case 'expenses': return <ExpenseView currentUser={currentUser} expenses={expenses} onAddExpense={(e) => { const n = [e, ...expenses]; setExpenses(n); PersistenceService.saveExpenses(n); if(settings.sync?.enabled) performSync('PUSH'); }} onDeleteExpense={(id) => { const n = expenses.filter(x => x.id !== id); setExpenses(n); PersistenceService.saveExpenses(n); if(settings.sync?.enabled) performSync('PUSH'); }} />;
      case 'reports': return <ReportsView currentUser={currentUser} orders={orders} expenses={expenses} purchases={purchases} />;
      case 'settings': return <SettingsView currentUser={currentUser} settings={settings} onUpdateSettings={handleUpdateSettings} printerConfig={printerConfig} onUpdatePrinter={handleUpdatePrinter} users={users} onUpdateUsers={handleUpdateUsers} onDataReset={loadLocalData} />;
      default: return <div className="p-10 text-center text-gray-400">Select a module from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden relative font-sans">
      {syncStatus !== 'idle' && (
          <div className={`absolute top-4 right-4 z-[200] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-all ${
            isSyncing ? 'bg-blue-600 animate-pulse' : 
            syncStatus === 'success' ? 'bg-green-600' : 
            syncStatus === 'error' ? 'bg-red-600' : 'bg-gray-600'
          }`}>
              {isSyncing ? <RefreshCw size={12} className="animate-spin"/> : syncStatus === 'success' ? <Check size={12}/> : <AlertCircle size={12}/>}
              {isSyncing ? 'Synchronizing Cloud...' : syncStatus === 'success' ? 'Database Synced' : 'Sync Error'}
          </div>
      )}
      {previewOrder && <ReceiptModal order={previewOrder} settings={settings} printerConfig={printerConfig} mode={printMode} onClose={() => setPreviewOrder(null)} />}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      <main className="flex-1 h-full overflow-hidden relative">{renderContent()}</main>
    </div>
  );
};

export default App;
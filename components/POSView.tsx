
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Printer, X, Check, Utensils, ShoppingBag, Bike, Scale, PauseCircle, PlayCircle, Percent, ShoppingCart, Hash } from 'lucide-react';
import { MenuItem, CartItem, Order, PaymentMethod, Addon, OrderType, Variation, OrderStatus, SystemSettings, Customer } from '../types';
import { PersistenceService } from '../services/persistenceService';

interface POSViewProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  currentOrderId: string | null;
  customers?: Customer[];
  categories: string[];
  onPlaceOrder: (items: CartItem[], total: number, type: OrderType, details: any, paymentMethod: PaymentMethod) => Order;
  onUpdateOrder: (items: CartItem[], total: number, type: OrderType, details: any, paymentMethod: PaymentMethod) => Order;
  onCancelEdit: () => void;
  onPrintReceipt: (order: Order) => void;
}

const POSView: React.FC<POSViewProps> = ({ 
    menuItems, cart, setCart, currentOrderId, customers = [], categories, onPlaceOrder, onUpdateOrder, onCancelEdit, onPrintReceipt 
}) => {
  const [settings] = useState<SystemSettings>(PersistenceService.getSettings());
  
  // Order Context State
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [tableNumber, setTableNumber] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [kitchenNote, setKitchenNote] = useState('');
  
  // Discount State
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [nextOrderNum, setNextOrderNum] = useState(PersistenceService.peekNextOrderNumber());
  
  // Modal for Selections
  const [selectionItem, setSelectionItem] = useState<MenuItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  
  // Hold Orders
  const [heldOrders, setHeldOrders] = useState<Order[]>([]);

  useEffect(() => {
      setNextOrderNum(PersistenceService.peekNextOrderNumber());
  }, [currentOrderId]);

  const subtotal = cart.reduce((sum, item) => {
      const basePrice = item.selectedVariation ? item.selectedVariation.price : item.price;
      const addonCost = (item.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
      return sum + ((basePrice + addonCost) * item.quantity);
  }, 0);

  const discountAmount = discountType === 'PERCENT' ? (subtotal * (discountValue / 100)) : discountValue;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = discountedSubtotal * (settings.taxRate / 100); 
  const serviceCharge = orderType === OrderType.DINE_IN ? discountedSubtotal * (settings.serviceChargeRate / 100) : 0;
  const total = discountedSubtotal + tax + serviceCharge;

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (!item.available) return false;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.urduName?.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const initiateAddToCart = (item: MenuItem) => {
      if ((item.variations && item.variations.length > 0) || (item.addons && item.addons.length > 0)) {
          setSelectionItem(item);
          setSelectedAddons([]);
          setSelectedVariation(item.variations && item.variations.length > 0 ? item.variations[0] : null);
      } else {
          addToCart(item, [], undefined);
      }
  };

  const addToCart = (item: MenuItem, addons: Addon[], variation?: Variation) => {
    setCart(prev => {
      const addonKey = addons.map(a => a.name).sort().join('|');
      const variationId = variation ? variation.id : 'base';
      const existingIndex = prev.findIndex(i => {
          const iAddonKey = (i.selectedAddons || []).map(a => a.name).sort().join('|');
          const iVariationId = i.selectedVariation ? i.selectedVariation.id : 'base';
          return i.id === item.id && iAddonKey === addonKey && iVariationId === variationId;
      });
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { ...item, quantity: 1, selectedAddons: addons, selectedVariation: variation }];
    });
    setSelectionItem(null);
  };

  const handleCheckout = (method: PaymentMethod) => {
    const details = {
        tableNumber: orderType === OrderType.DINE_IN ? tableNumber : undefined,
        customerName, customerPhone,
        deliveryAddress: orderType === OrderType.DELIVERY ? deliveryAddress : undefined,
        kitchenNote, subtotal, taxAmount: tax, discountAmount, serviceChargeAmount: serviceCharge,
    };
    if (currentOrderId) {
        onUpdateOrder(cart, total, orderType, details, method);
    } else {
        onPlaceOrder(cart, total, orderType, details, method);
        setNextOrderNum(PersistenceService.peekNextOrderNumber());
    }
    resetPos();
  };

  const resetPos = () => {
    setIsCheckingOut(false);
    setKitchenNote('');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setCart([]);
    setDiscountValue(0);
    if(onCancelEdit) onCancelEdit();
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-surface relative">
      {/* Selection Modal (Variations/Addons) */}
      {selectionItem && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{selectionItem.name}</h2>
                        <p className="text-sm text-gray-500 font-urdu">{selectionItem.urduName}</p>
                      </div>
                      <button onClick={() => setSelectionItem(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {selectionItem.variations && selectionItem.variations.length > 0 && (
                        <div>
                            <p className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest"><Scale size={16}/> Select Size:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {selectionItem.variations.map((v) => (
                                    <button key={v.id} onClick={() => setSelectedVariation(v)} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${selectedVariation?.id === v.id ? 'border-primary bg-red-50 text-primary shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                                        <span className="font-bold text-lg">{v.name}</span>
                                        {v.urduName && <span className="font-urdu text-sm">{v.urduName}</span>}
                                        <span className="mt-1 font-mono font-bold">Rs. {v.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectionItem.addons && selectionItem.addons.length > 0 && (
                        <div>
                            <p className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest"><Plus size={16}/> Add-ons:</p>
                            <div className="space-y-2">
                                {selectionItem.addons.map((addon, idx) => {
                                    const isSelected = selectedAddons.some(a => a.name === addon.name);
                                    return (
                                        <div key={idx} onClick={() => isSelected ? setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name)) : setSelectedAddons([...selectedAddons, addon])} className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-red-50 text-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <span className="font-medium">{addon.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">+ Rs. {addon.price}</span>
                                                {isSelected && <Check size={16} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                  </div>
                  <button onClick={() => addToCart(selectionItem, selectedAddons, selectedVariation || undefined)} className="w-full mt-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-red-800 transition-colors text-lg flex justify-between px-6 items-center">
                      <span>Add to Order</span>
                      <span>Rs. {((selectedVariation ? selectedVariation.price : selectionItem.price) + selectedAddons.reduce((s, a) => s + a.price, 0))}</span>
                  </button>
              </div>
          </div>
      )}

      {/* Main UI */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white p-4 shadow-sm z-10 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">POS Terminal</h1>
                <div className="flex items-center gap-2 mt-0.5">
                   <Hash size={14} className="text-gray-400" />
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Order: #{nextOrderNum}</span>
                </div>
              </div>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">OFFLINE MODE</span>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search menu / تلاش کریں" className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-urdu" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>
        
        <div className="bg-white px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar border-b">
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-secondary text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col border-2 border-transparent hover:border-primary/20" onClick={() => initiateAddToCart(item)}>
                <div className="h-32 sm:h-40 overflow-hidden relative shrink-0 bg-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  {item.isBestseller && <div className="absolute top-2 left-2 bg-amber-400 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">BESTSELLER</div>}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white font-bold text-xs">Rs. {item.price}</p>
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h3>
                  <p className="font-urdu text-primary text-xs mt-1 text-right">{item.urduName}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Order Panel */}
      <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col h-[50vh] lg:h-full shadow-2xl relative z-40 rounded-t-3xl lg:rounded-none">
        <div className="flex p-2 bg-gray-50 border-b">
            {[
                { type: OrderType.DINE_IN, icon: Utensils, label: 'Dine-In' },
                { type: OrderType.TAKEAWAY, icon: ShoppingBag, label: 'Takeaway' },
                { type: OrderType.DELIVERY, icon: Bike, label: 'Delivery' },
            ].map(t => (
                <button key={t.type} onClick={() => setOrderType(t.type)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${orderType === t.type ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-400 hover:text-gray-600'}`}>
                    <t.icon size={18} />
                    <span className="text-[10px] mt-1 font-bold">{t.label}</span>
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
               {currentOrderId ? <PlayCircle size={16} className="text-blue-500 animate-pulse"/> : <ShoppingCart size={16} className="text-gray-400"/>}
               {currentOrderId ? `Editing #${currentOrderId.slice(-4)}` : 'Cart'}
            </h2>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-red-500 font-bold hover:underline">Clear</button>}
          </div>

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
              <Grid size={48} className="mb-2 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest">Cart is Empty</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-3 border-b border-dashed border-gray-100 pb-3 group">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    {item.selectedVariation && <div className="text-[10px] font-bold text-primary italic">{item.selectedVariation.name}</div>}
                    <div className="text-xs font-bold text-gray-500 mt-1">Rs. {((item.selectedVariation?.price || item.price) + (item.selectedAddons?.reduce((s,a)=>s+a.price, 0) || 0)) * item.quantity}</div>
                    <div className="flex items-center mt-2 gap-3">
                        <button onClick={() => setCart(prev => prev.map((it, idx) => idx === index ? {...it, quantity: Math.max(1, it.quantity - 1)} : it))} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><Minus size={12}/></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => setCart(prev => prev.map((it, idx) => idx === index ? {...it, quantity: it.quantity + 1} : it))} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><Plus size={12}/></button>
                    </div>
                  </div>
                  <button onClick={() => setCart(prev => prev.filter((_, idx) => idx !== index))} className="text-gray-300 hover:text-red-500 self-center p-2"><Trash2 size={16}/></button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-1 mb-4 text-xs font-bold">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>Rs. {subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between text-gray-400"><span>GST ({settings.taxRate}%)</span><span>Rs. {tax.toFixed(0)}</span></div>
            <div className="flex justify-between text-primary text-sm pt-2 border-t mt-2"><span>TOTAL</span><span>Rs. {total.toFixed(0)}</span></div>
          </div>
          <button disabled={cart.length === 0} onClick={() => setIsCheckingOut(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 disabled:bg-gray-300 transition-all flex justify-center items-center gap-2">
              <Printer size={18} /> Checkout
          </button>
        </div>
      </div>

      {/* Payment Overlay */}
      {isCheckingOut && (
          <div className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-sm p-8 shadow-2xl animate-scale-up">
                  <h3 className="text-2xl font-bold text-center mb-6">Confirm Order</h3>
                  <div className="space-y-3 mb-8">
                      <button onClick={() => handleCheckout(PaymentMethod.CASH)} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                          <Banknote size={24}/> Cash Payment
                      </button>
                      <button onClick={() => handleCheckout(PaymentMethod.CARD)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                          <CreditCard size={24}/> Card Payment
                      </button>
                      <button onClick={() => setIsCheckingOut(false)} className="w-full py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl">Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default POSView;

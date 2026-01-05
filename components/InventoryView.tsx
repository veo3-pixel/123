
import React, { useState } from 'react';
import { InventoryItem, Purchase, PurchaseItem, StockTransaction, TransactionType } from '../types';
import { AlertTriangle, Package, ShoppingCart, History, Plus, Save, Minus, Truck, X, Trash2, Edit2 } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  purchases: Purchase[];
  transactions: StockTransaction[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onPurchase: (supplier: string, items: PurchaseItem[]) => void;
  onAdjustStock: (itemId: string, newQuantity: number, reason: string) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ 
    inventory, purchases, transactions, onAddInventoryItem, onUpdateInventoryItem, onPurchase, onAdjustStock 
}) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'PURCHASE' | 'HISTORY'>('STOCK');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ name: '', unit: 'kg', threshold: 5, quantity: 0 });
  
  // Purchase State
  const [supplier, setSupplier] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  // Adjustment State
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<string>('');

  // Handlers
  const handleAddItem = () => {
      if(newItem.name && newItem.unit) {
          onAddInventoryItem({
              id: Math.random().toString(36).substr(2, 9),
              name: newItem.name,
              unit: newItem.unit,
              threshold: newItem.threshold || 5,
              quantity: newItem.quantity || 0,
              costPrice: 0
          });
          setIsAddingItem(false);
          setNewItem({ name: '', unit: 'kg', threshold: 5, quantity: 0 });
      }
  };

  const handleUpdateItem = () => {
      if(editingItem && editingItem.name && editingItem.unit) {
          onUpdateInventoryItem(editingItem);
          setEditingItem(null);
      }
  };

  const handleAdjustClick = (item: InventoryItem) => {
      const pin = prompt("Enter Admin PIN to adjust stock:");
      if (pin === '1234') {
          setAdjustingItemId(item.id);
          setAdjustQty(item.quantity.toString());
      } else if (pin !== null) {
          alert("Incorrect PIN");
      }
  };

  const submitAdjustment = (id: string) => {
      const qty = parseFloat(adjustQty);
      if(!isNaN(qty)) {
          onAdjustStock(id, qty, 'Manual Admin Adjustment');
          setAdjustingItemId(null);
      }
  };

  const addPurchaseItemRow = () => {
      if (inventory.length > 0) {
          setPurchaseItems([...purchaseItems, { inventoryItemId: inventory[0].id, quantity: 0, cost: 0 }]);
      } else {
          alert("No inventory items found. Please create a new item first.");
          setIsAddingItem(true);
      }
  };

  const updatePurchaseItem = (index: number, field: keyof PurchaseItem, value: any) => {
      const updated = [...purchaseItems];
      updated[index] = { ...updated[index], [field]: value };
      setPurchaseItems(updated);
  };

  const removePurchaseItem = (index: number) => {
      setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const submitPurchase = () => {
      if(purchaseItems.length > 0) {
          // Default to 'Local Purchase' if supplier is empty
          const finalSupplier = supplier.trim() || 'Local Purchase';
          
          onPurchase(finalSupplier, purchaseItems);
          setSupplier('');
          setPurchaseItems([]);
          alert("Purchase Order Created & Stock Updated");
      }
  };

  const getItemName = (id: string) => inventory.find(i => i.id === id)?.name || 'Unknown';
  const getItemUnit = (id: string) => inventory.find(i => i.id === id)?.unit || '';

  return (
    <div className="p-6 h-full flex flex-col bg-surface overflow-hidden relative">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
           <span className="font-urdu text-lg text-gray-500">اسٹاک اور خریداری</span>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
            <button 
                onClick={() => setActiveTab('STOCK')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'STOCK' ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Package size={16} /> Stock List
            </button>
            <button 
                onClick={() => setActiveTab('PURCHASE')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'PURCHASE' ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <ShoppingCart size={16} /> Purchasing
            </button>
            <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <History size={16} /> History
            </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        {/* TAB 1: STOCK MASTER */}
        {activeTab === 'STOCK' && (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Current Stock Levels</h3>
                    <button onClick={() => setIsAddingItem(true)} className="text-sm bg-primary text-white px-3 py-1.5 rounded hover:bg-red-800 flex items-center gap-1">
                        <Plus size={16} /> New Item
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Unit</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inventory.map(item => {
                        const isLow = item.quantity <= item.threshold;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 text-gray-600 font-bold">
                                {adjustingItemId === item.id ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            className="w-20 border rounded p-1 text-sm" 
                                            value={adjustQty}
                                            onChange={(e) => setAdjustQty(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={() => submitAdjustment(item.id)} className="text-green-600"><Save size={16}/></button>
                                        <button onClick={() => setAdjustingItemId(null)} className="text-gray-400"><X size={16}/></button>
                                    </div>
                                ) : (
                                    item.quantity
                                )}
                            </td>
                            <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                            <td className="px-6 py-4">
                                {isLow ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertTriangle size={12} className="mr-1" /> Low Stock
                                </span>
                                ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    OK
                                </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button 
                                    onClick={() => setEditingItem(item)}
                                    className="text-gray-500 hover:text-blue-600 p-1"
                                    title="Edit Item Details"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleAdjustClick(item)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                                >
                                    Adjust
                                </button>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB 2: PURCHASE ENTRY */}
        {activeTab === 'PURCHASE' && (
             <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-6">
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Truck size={20} className="text-primary"/>
                            New Purchase Order
                        </h2>
                     </div>
                     
                     <div className="mb-6">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name (Optional)</label>
                         <input 
                            className="w-full border rounded-lg px-4 py-2" 
                            placeholder="Default: Local Purchase"
                            value={supplier}
                            onChange={e => setSupplier(e.target.value)}
                        />
                     </div>

                     <div className="mb-4">
                         <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Items</label>
                            <div className="flex gap-4">
                                <button onClick={() => setIsAddingItem(true)} className="text-sm text-green-600 font-bold hover:underline flex items-center gap-1">
                                    <Plus size={14}/> Create New Item
                                </button>
                                <button onClick={addPurchaseItemRow} className="text-sm text-primary font-bold hover:underline">+ Add Item Line</button>
                            </div>
                         </div>
                         <div className="space-y-3">
                             {purchaseItems.map((pItem, idx) => (
                                 <div key={idx} className="flex gap-3 items-center">
                                     <select 
                                        className="flex-1 border rounded px-3 py-2 text-sm"
                                        value={pItem.inventoryItemId}
                                        onChange={(e) => updatePurchaseItem(idx, 'inventoryItemId', e.target.value)}
                                     >
                                         {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                     </select>
                                     <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            className="w-24 border rounded px-3 py-2 text-sm" 
                                            placeholder="Qty"
                                            value={pItem.quantity}
                                            onChange={(e) => updatePurchaseItem(idx, 'quantity', Number(e.target.value))}
                                        />
                                        <span className="text-xs text-gray-500 w-8">{getItemUnit(pItem.inventoryItemId)}</span>
                                     </div>
                                     <input 
                                        type="number" 
                                        className="w-28 border rounded px-3 py-2 text-sm" 
                                        placeholder="Cost (Rs)"
                                        value={pItem.cost}
                                        onChange={(e) => updatePurchaseItem(idx, 'cost', Number(e.target.value))}
                                    />
                                     <button onClick={() => removePurchaseItem(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                         <Trash2 size={18} />
                                     </button>
                                 </div>
                             ))}
                             {purchaseItems.length === 0 && (
                                 <div className="text-center py-8 text-gray-400 bg-white rounded border border-dashed">
                                     Click "+ Add Item Line" to start adding items.
                                 </div>
                             )}
                         </div>
                     </div>

                     <div className="flex justify-end pt-4 border-t mt-4">
                         <button 
                            disabled={purchaseItems.length === 0}
                            onClick={submitPurchase}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                        >
                             Save & Update Stock
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'HISTORY' && (
             <div className="flex flex-col h-full overflow-hidden">
                 <div className="p-4 bg-gray-50 border-b">
                     <h3 className="font-bold text-gray-700">Stock Movement History</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto">
                     <table className="w-full text-left">
                         <thead className="bg-white border-b sticky top-0">
                             <tr>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Change</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reference / Reason</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 text-sm">
                             {[...transactions].reverse().map(txn => (
                                 <tr key={txn.id} className="hover:bg-gray-50">
                                     <td className="px-6 py-3 text-gray-500">{txn.date.toLocaleString()}</td>
                                     <td className="px-6 py-3 font-medium">{getItemName(txn.inventoryItemId)}</td>
                                     <td className="px-6 py-3">
                                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                             txn.type === TransactionType.PURCHASE ? 'bg-green-100 text-green-700' :
                                             txn.type === TransactionType.SALE ? 'bg-blue-100 text-blue-700' :
                                             'bg-orange-100 text-orange-700'
                                         }`}>
                                             {txn.type}
                                         </span>
                                     </td>
                                     <td className={`px-6 py-3 font-bold ${txn.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                         {txn.quantityChange > 0 ? '+' : ''}{txn.quantityChange} {getItemUnit(txn.inventoryItemId)}
                                     </td>
                                     <td className="px-6 py-3 text-gray-600">{txn.reason || txn.referenceId || '-'}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        )}

      </div>

      {/* NEW ITEM MODAL */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Add New Item</h3>
                    <button onClick={() => setIsAddingItem(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                        <input 
                            className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                            placeholder="e.g. Lamb Meat" 
                            value={newItem.name} 
                            onChange={e => setNewItem({...newItem, name: e.target.value})} 
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                            <select 
                                className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                                value={newItem.unit} 
                                onChange={e => setNewItem({...newItem, unit: e.target.value})}
                            >
                                <option value="kg">kg</option>
                                <option value="L">Liter</option>
                                <option value="pcs">Pieces</option>
                                <option value="box">Box</option>
                                <option value="g">Grams</option>
                                <option value="ml">ml</option>
                                <option value="dozen">Dozen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Low Stock Alert</label>
                            <input 
                                type="number" 
                                className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                                value={newItem.threshold} 
                                onChange={e => setNewItem({...newItem, threshold: Number(e.target.value)})} 
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Initial Quantity (Optional)</label>
                         <input 
                            type="number" 
                            className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                            value={newItem.quantity} 
                            onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                            placeholder="0"
                        />
                         <p className="text-[10px] text-gray-500 mt-1">If you are entering a purchase now, you can leave this as 0 and add quantity in the Purchase Order.</p>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setIsAddingItem(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleAddItem} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200">Save Item</button>
                </div>
            </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Edit Item</h3>
                    <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                        <input 
                            className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                            value={editingItem.name} 
                            onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                            <select 
                                className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                                value={editingItem.unit} 
                                onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                            >
                                <option value="kg">kg</option>
                                <option value="L">Liter</option>
                                <option value="pcs">Pieces</option>
                                <option value="box">Box</option>
                                <option value="g">Grams</option>
                                <option value="ml">ml</option>
                                <option value="dozen">Dozen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Low Stock Alert</label>
                            <input 
                                type="number" 
                                className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                                value={editingItem.threshold} 
                                onChange={e => setEditingItem({...editingItem, threshold: Number(e.target.value)})} 
                            />
                        </div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded border border-orange-100">
                        <p className="text-xs text-orange-800">
                            Current Quantity: <b>{editingItem.quantity} {editingItem.unit}</b> <br/>
                            To change quantity, please use the "Adjust" or "Purchase" functions.
                        </p>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleUpdateItem} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg">Update</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default InventoryView;

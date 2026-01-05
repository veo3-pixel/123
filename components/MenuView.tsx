
import React, { useState, useRef } from 'react';
import { MenuItem, KitchenStation, InventoryItem, UserRole, User } from '../types';
import { Plus, Trash2, Save, X, Edit2, Tag, Search, LayoutGrid, ChefHat, Camera, Upload, Lock } from 'lucide-react';

interface MenuViewProps {
  currentUser: User;
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  categories: string[];
  onUpdateMenu: (items: MenuItem[]) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
}

const MenuView: React.FC<MenuViewProps> = ({ currentUser, menuItems, inventory, categories, onUpdateMenu, onAddCategory, onUpdateCategory }) => {
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<{old: string, current: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSaveItem = () => {
    if (!isAdmin || !editingItem?.name) return;
    const item: MenuItem = {
        id: editingItem.id || Math.random().toString(36).substr(2, 9),
        name: editingItem.name,
        urduName: editingItem.urduName || '',
        description: editingItem.description || '',
        price: Number(editingItem.price) || 0,
        category: editingItem.category || (categories.length > 0 ? categories[0] : 'General'),
        image: editingItem.image || 'https://via.placeholder.com/400',
        available: editingItem.available ?? true,
        station: editingItem.station || KitchenStation.MAIN_KITCHEN,
        variations: editingItem.variations || [],
        addons: editingItem.addons || [],
        recipe: editingItem.recipe || []
    };
    onUpdateMenu(editingItem.id ? menuItems.map(i => i.id === item.id ? item : i) : [...menuItems, item]);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
      if(!isAdmin) return;
      if(confirm("Delete this menu item?")) {
          onUpdateMenu(menuItems.filter(i => i.id !== id));
          setEditingItem(null);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Restricted Access</h2>
        <p className="text-gray-500 max-w-sm font-urdu">صرف سپر ایڈمن ہی مینو اور تصاویر تبدیل کر سکتا ہے۔</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden relative">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
                <p className="text-xs text-gray-500 font-urdu">مینو ایڈیٹر اور کیٹیگری کا انتظام</p>
            </div>
            <div className="flex gap-2">
                 <button onClick={() => setShowCatManager(true)} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 font-bold text-xs">
                    <Tag size={16}/> Manage Categories
                 </button>
                 <button onClick={() => setEditingItem({ available: true, variations: [], addons: [] })} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-800 font-bold text-sm">
                    <Plus size={18} /> Add New Item
                 </button>
            </div>
        </div>
        
        <div className="bg-white px-4 pb-4 flex gap-3 border-b">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search menu items..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="border rounded-lg px-4 py-2 text-sm bg-gray-50 font-bold" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {menuItems.filter(i => (selectedCategory === 'All' || i.category === selectedCategory) && i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                <div key={item.id} onClick={() => setEditingItem(item)} className="bg-white p-3 rounded-xl shadow-sm border-2 border-transparent cursor-pointer hover:border-primary transition-all group">
                    <div className="h-32 bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                        <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.name} />
                        {!item.available && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">OUT OF STOCK</div>}
                    </div>
                    <h3 className="font-bold text-sm truncate">{item.name}</h3>
                    <p className="font-urdu text-xs text-primary font-bold text-right truncate">{item.urduName}</p>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-900 font-bold">Rs. {item.price}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border">{item.category}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* ITEM EDITOR SLIDEOUT */}
      {editingItem && (
          <div className="w-full md:w-[450px] bg-white border-l shadow-2xl absolute inset-y-0 right-0 z-50 flex flex-col animate-fade-in">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="font-bold text-lg">{editingItem.id ? 'Edit Menu Item' : 'New Menu Item'}</h2>
                  <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
              </div>
              
              <div className="flex-1 p-6 space-y-5 overflow-y-auto no-scrollbar">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Item Image / تصویر</label>
                    <div 
                      className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                        <img 
                          src={editingItem.image || 'https://via.placeholder.com/400'} 
                          className="w-full h-full object-cover" 
                          alt="Preview" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                            <Camera size={32} />
                            <span className="text-xs font-bold uppercase">Change Photo</span>
                        </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full mt-2 py-2 border-2 border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Upload size={14}/> Upload Local Image / تصویر تبدیل کریں
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">General Info</label>
                    <div className="space-y-3">
                        <input className="w-full border rounded-lg p-2.5 text-sm" placeholder="English Name" value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                        <input className="w-full border rounded-lg p-2.5 text-sm font-urdu text-right" placeholder="اردو نام" value={editingItem.urduName || ''} onChange={e => setEditingItem({...editingItem, urduName: e.target.value})} />
                        <select className="w-full border rounded-lg p-2.5 text-sm font-bold" value={editingItem.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <textarea className="w-full border rounded-lg p-2.5 text-sm resize-none" placeholder="Description" rows={2} value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Base Price (Rs.)</label>
                          <input type="number" className="w-full border rounded-lg p-2.5 text-sm font-bold" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kitchen Station</label>
                          <select className="w-full border rounded-lg p-2.5 text-sm" value={editingItem.station || ''} onChange={e => setEditingItem({...editingItem, station: e.target.value as KitchenStation})}>
                              {Object.values(KitchenStation).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Availability</label>
                    <button onClick={() => setEditingItem({...editingItem, available: !editingItem.available})} className={`w-full py-2 rounded-lg font-bold text-sm border-2 transition-colors ${editingItem.available ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'}`}>
                        {editingItem.available ? 'IN STOCK / دستیاب ہے' : 'OUT OF STOCK / ختم ہو گیا'}
                    </button>
                  </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex gap-3">
                  {editingItem.id && (
                      <button onClick={() => handleDeleteItem(editingItem.id!)} className="p-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50">
                          <Trash2 size={20} />
                      </button>
                  )}
                  <button onClick={handleSaveItem} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-800 flex items-center justify-center gap-2 shadow-lg">
                      <Save size={18} /> Save Menu Item
                  </button>
              </div>
          </div>
      )}

      {/* CATEGORY MANAGER MODAL */}
      {showCatManager && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold flex items-center gap-2"><Tag size={18}/> Manage Categories</h3>
                      <button onClick={() => setShowCatManager(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="p-4 bg-white border-b flex gap-2">
                      <input className="flex-1 border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" placeholder="Type new category..." value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && newCatName.trim() && (onAddCategory(newCatName), setNewCatName(''))} />
                      <button onClick={() => { if(newCatName.trim()) { onAddCategory(newCatName); setNewCatName(''); } }} className="bg-green-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-green-700">Add</button>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto space-y-2 bg-gray-50">
                      {categories.map((cat) => (
                          <div key={cat} className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-transparent shadow-sm group">
                              {editingCatName?.old === cat ? (
                                  <div className="flex-1 flex gap-2">
                                      <input className="flex-1 border rounded px-2 py-1 text-sm font-bold focus:border-primary" value={editingCatName.current} onChange={e => setEditingCatName({...editingCatName, current: e.target.value})} autoFocus />
                                      <button onClick={() => { onUpdateCategory(editingCatName.old, editingCatName.current); setEditingCatName(null); }} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={18}/></button>
                                      <button onClick={() => setEditingCatName(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={18}/></button>
                                  </div>
                              ) : (
                                  <>
                                      <span className="text-sm font-bold text-gray-700">{cat}</span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => setEditingCatName({old: cat, current: cat})} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                              <Edit2 size={16}/>
                                          </button>
                                          <button onClick={() => { if(confirm(`Delete category "${cat}"? Items will remain but category link will be broken.`)) onUpdateMenu(menuItems.map(i => i.category === cat ? {...i, category: 'Uncategorized'} : i)); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                              <Trash2 size={16}/>
                                          </button>
                                      </div>
                                  </>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MenuView;

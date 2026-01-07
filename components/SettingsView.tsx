import React, { useState, useRef } from 'react';
import { PersistenceService } from '../services/persistenceService';
import { 
  Database, Download, Upload, AlertTriangle, RefreshCw, CheckCircle, 
  Printer, User as UserIcon, Plus, Trash2, Key, Shield, Edit2, 
  Store, Percent, Eye, EyeOff, Info, Cloud, Loader2, Play, X, UserPlus, Save, CheckSquare, Square
} from 'lucide-react';
import { User, PrinterConfig, UserRole, Permission, SystemSettings } from '../types';

interface SettingsViewProps {
  currentUser: User;
  settings: SystemSettings;
  onUpdateSettings: (s: SystemSettings) => void;
  printerConfig: PrinterConfig;
  onUpdatePrinter: (p: PrinterConfig) => void;
  users: User[];
  onUpdateUsers: (u: User[]) => void;
  onDataReset: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentUser, settings, onUpdateSettings, printerConfig, onUpdatePrinter, users, onUpdateUsers, onDataReset 
}) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'USERS' | 'PRINTER' | 'CLOUD' | 'SYSTEM' | 'ABOUT'>('GENERAL');
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const AVAILABLE_PERMISSIONS: { id: Permission, label: string, urdu: string }[] = [
    { id: 'ACCESS_POS', label: 'POS Terminal', urdu: 'پی او ایس ٹرمینل' },
    { id: 'ACCESS_KITCHEN', label: 'Kitchen Display', urdu: 'کچن اسکرین' },
    { id: 'VIEW_DASHBOARD', label: 'Dashboard', urdu: 'ڈیش بورڈ' },
    { id: 'VIEW_REPORTS', label: 'Reports', urdu: 'رپورٹس' },
    { id: 'MANAGE_INVENTORY', label: 'Inventory', urdu: 'اسٹاک' },
    { id: 'MANAGE_MENU', label: 'Menu Editor', urdu: 'مینو ایڈیٹر' },
    { id: 'MANAGE_EXPENSES', label: 'Expenses', urdu: 'اخراجات' },
    { id: 'MANAGE_SETTINGS', label: 'Settings', urdu: 'ترتیبات' },
    { id: 'PROCESS_REFUND', label: 'Refunds', urdu: 'ریفنڈ' },
    { id: 'ADJUST_STOCK', label: 'Stock Adjustment', urdu: 'اسٹاک ایڈجسٹمنٹ' },
  ];

  const handleTestDropbox = async () => {
    const token = settings.sync?.dropbox?.accessToken?.trim();
    if (!token) {
      showMsg('Please enter a valid Dropbox Access Token first.', 'error');
      return;
    }
    setIsConnecting(true);
    try {
      const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: 'null'
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateSettings({ ...settings, sync: { ...settings.sync, enabled: true, dropbox: { accessToken: token } } as any });
        showMsg(`Connected as ${data.name.display_name}. Cloud sync active!`);
      } else {
        throw new Error('Invalid Token');
      }
    } catch (e: any) {
      showMsg(`Connection Failed: ${e.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBackup = () => {
    const data = PersistenceService.createBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Shinwari_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showMsg('Local backup file created and downloaded.');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = PersistenceService.restoreBackup(event.target?.result as string);
      if (success) {
        showMsg('Database restored successfully. Refreshing...');
        setTimeout(() => onDataReset(), 1000);
      } else {
        showMsg('Failed to restore. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('CRITICAL: This will permanently wipe all your data (Orders, Stock, Expenses). Continue?')) {
      const pin = prompt('Confirm Master PIN to clear database:');
      if (pin === '1234' || pin === '9221') {
        PersistenceService.clearDatabase();
        showMsg('System reset complete.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert('Unauthorized PIN. Action aborted.');
      }
    }
  };

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.pin) {
      showMsg('Please fill in Name and PIN.', 'error');
      return;
    }
    const newUser: User = {
      id: editingUser.id || Math.random().toString(36).substr(2, 9),
      name: editingUser.name,
      pin: editingUser.pin,
      role: editingUser.role || UserRole.CASHIER,
      permissions: editingUser.permissions || ['ACCESS_POS']
    };
    const updatedUsers = editingUser.id 
      ? users.map(u => u.id === editingUser.id ? newUser : u)
      : [...users, newUser];
    onUpdateUsers(updatedUsers);
    setEditingUser(null);
    showMsg('User permissions updated.');
  };

  const togglePermission = (perm: Permission) => {
    if (!editingUser) return;
    const current = editingUser.permissions || [];
    const updated = current.includes(perm) 
      ? current.filter(p => p !== perm) 
      : [...current, perm];
    setEditingUser({ ...editingUser, permissions: updated });
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10">
        <Shield size={64} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold">Admin Privileges Required</h2>
        <p className="text-gray-500 font-urdu mt-2">ترتیبات تبدیل کرنے کے لیے ایڈمن رسائی ضروری ہے۔</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-surface flex flex-col no-scrollbar">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Management</h1>
          <span className="font-urdu text-lg text-gray-500">سسٹم کی ترتیبات</span>
        </div>
      </div>

      {statusMsg && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-2xl flex items-center gap-3 animate-scale-up border shadow-2xl ${statusMsg.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          <span className="font-bold text-lg">{statusMsg.text}</span>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b overflow-x-auto no-scrollbar bg-white p-1 rounded-t-2xl shadow-sm">
        {[
          { id: 'GENERAL', label: 'Branding', icon: Store },
          { id: 'USERS', label: 'Staff Access', icon: UserIcon },
          { id: 'PRINTER', label: 'Thermal Printer', icon: Printer },
          { id: 'CLOUD', label: 'Cloud Backup', icon: Cloud },
          { id: 'SYSTEM', label: 'Maintenance', icon: Database },
          { id: 'ABOUT', label: 'System Info', icon: Info },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'GENERAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in pb-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4"><Store size={20} className="text-primary"/> Store Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Restaurant Name (English)</label>
                  <input className="w-full border rounded-xl p-3 focus:border-primary outline-none font-bold" value={settings.restaurantName} onChange={e => onUpdateSettings({...settings, restaurantName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Restaurant Name (Urdu)</label>
                  <input className="w-full border rounded-xl p-3 font-urdu text-right focus:border-primary outline-none text-2xl" value={settings.restaurantUrduName} onChange={e => onUpdateSettings({...settings, restaurantUrduName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Phone</label>
                    <input className="w-full border rounded-xl p-3 focus:border-primary outline-none" value={settings.phone} onChange={e => onUpdateSettings({...settings, phone: e.target.value})} />
                   </div>
                   <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Currency Unit</label>
                    <input className="w-full border rounded-xl p-3 focus:border-primary outline-none font-bold" value={settings.currencySymbol} onChange={e => onUpdateSettings({...settings, currencySymbol: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Physical Address</label>
                  <textarea className="w-full border rounded-xl p-3 resize-none focus:border-primary outline-none" rows={2} value={settings.address} onChange={e => onUpdateSettings({...settings, address: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4"><Percent size={20} className="text-primary"/> Taxes & Charges</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">FBR / GST Rate (%)</label>
                    <input type="number" className="w-full border rounded-xl p-3 text-xl font-bold focus:border-primary outline-none" value={settings.taxRate} onChange={e => onUpdateSettings({...settings, taxRate: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Service Charge (%)</label>
                    <input type="number" className="w-full border rounded-xl p-3 text-xl font-bold focus:border-primary outline-none" value={settings.serviceChargeRate} onChange={e => onUpdateSettings({...settings, serviceChargeRate: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Default Receipt Footer Note</label>
                  <input className="w-full border rounded-xl p-3 focus:border-primary outline-none" value={settings.receiptFooter} onChange={e => onUpdateSettings({...settings, receiptFooter: e.target.value})} />
                </div>
                <button onClick={() => showMsg('Branding updated successfully.')} className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center gap-2">
                  <Save size={20}/> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-6 animate-fade-in pb-10">
             <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border shadow-sm gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Staff Account Management</h2>
                  <p className="text-sm text-gray-500">Add, remove or update permissions for your restaurant staff.</p>
                </div>
                <button onClick={() => setEditingUser({ role: UserRole.CASHIER, permissions: ['ACCESS_POS'] })} className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-800 shadow-lg shadow-red-200">
                  <UserPlus size={20} /> New Staff Account
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <div key={user.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col relative group hover:border-primary transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-primary border-2 border-gray-50 shadow-inner">
                         <UserIcon size={28}/>
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
                          <div className="flex gap-1">
                             <span className="text-[8px] font-black uppercase tracking-widest text-white bg-secondary px-2 py-0.5 rounded">{user.role}</span>
                             <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">{user.permissions.length} PERMS</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-dashed">
                       <Key size={16} className="text-gray-400"/> Security PIN: <span className="font-mono font-black text-gray-800 tracking-widest">****</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingUser(user)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                        <Edit2 size={16}/> Edit Permissions
                      </button>
                      <button 
                        onClick={() => { if(confirm(`Confirm deletion of staff: ${user.name}?`)) onUpdateUsers(users.filter(u => u.id !== user.id)) }}
                        className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'PRINTER' && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-2xl animate-fade-in mx-auto mt-10">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                  <Printer size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-800">Printer Setup</h2>
                <p className="text-gray-500 mt-2">Configure your thermal bill printer specifications.</p>
             </div>
             
             <div className="space-y-10">
                <div>
                   <label className="text-xs font-black text-gray-400 uppercase block mb-4 tracking-widest text-center">Receipt Paper Width</label>
                   <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => onUpdatePrinter({...printerConfig, paperWidth: '58mm'})} className={`p-8 border-2 rounded-3xl flex flex-col items-center gap-4 transition-all ${printerConfig.paperWidth === '58mm' ? 'border-primary bg-red-50 text-primary shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-gray-200 text-gray-400 bg-white'}`}>
                         <span className="text-4xl font-black">58mm</span>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Small / Mobile</span>
                      </button>
                      <button onClick={() => onUpdatePrinter({...printerConfig, paperWidth: '80mm'})} className={`p-8 border-2 rounded-3xl flex flex-col items-center gap-4 transition-all ${printerConfig.paperWidth === '80mm' ? 'border-primary bg-red-50 text-primary shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-gray-200 text-gray-400 bg-white'}`}>
                         <span className="text-4xl font-black">80mm</span>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Full / Desktop</span>
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border">
                   <div>
                      <p className="font-black text-gray-800 text-lg">Auto-Print Dialog</p>
                      <p className="text-sm text-gray-500 max-w-xs">Show printer dialog immediately after completing an order.</p>
                   </div>
                   <button 
                    onClick={() => onUpdatePrinter({...printerConfig, autoPrint: !printerConfig.autoPrint})}
                    className={`w-16 h-9 rounded-full relative transition-all shadow-inner ${printerConfig.autoPrint ? 'bg-primary' : 'bg-gray-300'}`}
                   >
                      <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${printerConfig.autoPrint ? 'left-8' : 'left-1'}`} />
                   </button>
                </div>

                <button onClick={() => showMsg('Printer settings updated.')} className="w-full py-5 bg-secondary text-white rounded-3xl font-black text-lg hover:bg-slate-700 shadow-xl transition-transform active:scale-[0.98]">
                  Confirm Printer Config
                </button>
             </div>
          </div>
        )}

        {activeTab === 'CLOUD' && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-2xl animate-fade-in mx-auto mt-10">
            <div className="flex items-center gap-6 mb-10 pb-6 border-b">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner"><Cloud size={32} /></div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Dropbox Sync</h2>
                <p className="text-sm text-gray-500">Automated secure off-site database backups.</p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase block mb-3 tracking-widest">Dropbox API Access Token</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="sl.xxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                    className="w-full border-2 border-gray-100 rounded-2xl p-5 font-mono text-sm focus:border-blue-400 outline-none pr-14 transition-all group-hover:border-gray-200" 
                    value={settings.sync?.dropbox?.accessToken || ''} 
                    onChange={e => onUpdateSettings({...settings, sync: { ...settings.sync, dropbox: { accessToken: e.target.value } } as any})} 
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-400"><Cloud size={20}/></div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={handleTestDropbox} disabled={isConnecting} className="flex-1 bg-white border-2 border-blue-100 text-blue-600 py-5 rounded-2xl font-bold hover:bg-blue-50 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                  {isConnecting ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} />} Verify Connection
                </button>
                <button onClick={() => showMsg('Sync configuration saved.')} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200">Save Config</button>
              </div>

              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl text-sm text-blue-800 space-y-2">
                 <p className="font-black flex items-center gap-2"><Info size={18}/> Integration Guide</p>
                 <ol className="list-decimal pl-5 space-y-1 opacity-80">
                   <li>Go to Dropbox App Console</li>
                   <li>Create a "Scoped Access" app with "Full Dropbox"</li>
                   <li>Add <code className="bg-white px-1 rounded">files.content.write</code> permission</li>
                   <li>Generate a token and paste it here</li>
                 </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in mt-10 max-w-5xl mx-auto pb-10">
             <div className="bg-white p-10 rounded-3xl border shadow-sm">
                <div className="flex items-center gap-3 mb-8 border-b pb-4">
                   <Database size={24} className="text-primary"/>
                   <h2 className="text-xl font-black">Data Management</h2>
                </div>
                <div className="space-y-4">
                   <button onClick={handleBackup} className="w-full flex items-center justify-between p-6 bg-green-50/50 border border-green-100 rounded-2xl hover:bg-green-100 transition-all group">
                      <div className="flex items-center gap-4">
                        <Download size={24} className="text-green-600" />
                        <div>
                           <span className="font-black block text-green-900">Export Backup</span>
                           <span className="text-[10px] text-green-600 font-bold uppercase">JSON Database File</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Plus size={20} className="text-green-400 rotate-45"/></div>
                   </button>
                   
                   <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-6 bg-blue-50/50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all group">
                      <div className="flex items-center gap-4">
                        <Upload size={24} className="text-blue-600" />
                        <div>
                           <span className="font-black block text-blue-900">Restore Data</span>
                           <span className="text-[10px] text-blue-600 font-bold uppercase">Import JSON File</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Plus size={20} className="text-blue-400"/></div>
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleRestore} />
                </div>
             </div>

             <div className="bg-red-50 p-10 rounded-3xl border border-red-100">
                <div className="flex items-center gap-3 mb-8 border-b border-red-200 pb-4">
                   <AlertTriangle size={24} className="text-red-600"/>
                   <h2 className="text-xl font-black text-red-900">Maintenance Zone</h2>
                </div>
                <p className="text-sm text-red-700 mb-8 font-medium leading-relaxed">Warning: The "System Reset" operation will completely wipe your local storage. This action is irreversible unless you have a recent backup file.</p>
                <button onClick={handleClearData} className="w-full bg-red-600 text-white py-6 rounded-2xl font-black text-lg hover:bg-red-700 shadow-2xl shadow-red-200 flex items-center justify-center gap-3 transition-transform active:scale-95">
                   <Trash2 size={24} /> System Factory Reset
                </button>
             </div>
          </div>
        )}
        
        {activeTab === 'ABOUT' && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border shadow-2xl animate-fade-in mt-10 max-w-4xl mx-auto">
              <div className="w-32 h-32 bg-primary/10 text-primary rounded-[30px] flex items-center justify-center mb-8 shadow-inner">
                 <Store size={64} />
              </div>
              <h2 className="text-5xl font-black text-gray-800 mb-2">Shinwari<span className="text-primary">ERP</span></h2>
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-gray-400 font-bold tracking-[0.2em] uppercase text-sm">Professional Suite v2.5</p>
              </div>
              
              <div className="grid grid-cols-2 gap-16 text-center mb-12 border-y py-10 w-full max-w-md">
                 <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">Build Status</p>
                    <p className="font-black text-xl text-gray-800">Production Ready</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">Engine</p>
                    <p className="font-black text-xl text-gray-800">React 19 Core</p>
                 </div>
              </div>

              <div className="p-8 bg-surface rounded-[30px] text-center border shadow-sm w-full max-w-lg">
                  <p className="text-xs text-gray-400 font-black uppercase mb-4 tracking-widest">Digital Architect</p>
                  <p className="text-3xl font-black text-secondary">Rana Rashid Rashid</p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="px-6 py-3 bg-white rounded-2xl border font-black text-primary shadow-sm">
                      0300-4097479
                    </div>
                  </div>
              </div>
              
              <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase opacity-50">© 2025 Shinwari Dera POS • All Rights Reserved</p>
          </div>
        )}
      </div>

      {/* STAFF USER ACCESS EDITOR MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[300] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-scale-up flex flex-col">
              <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-gray-800">{editingUser.id ? 'Edit Staff Permissions' : 'Create Staff Account'}</h3>
                    <p className="text-sm text-gray-500 font-urdu">{editingUser.id ? 'سٹاف کی اجازتیں تبدیل کریں' : 'نیا سٹاف اکاؤنٹ بنائیں'}</p>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors"><X size={28}/></button>
              </div>
              
              <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Full Display Name</label>
                        <input className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none font-bold text-lg" placeholder="e.g. Ali Ahmed" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Access Key (4-6 Digits)</label>
                        <input className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none font-mono text-2xl text-center tracking-[0.5em]" maxLength={6} placeholder="0000" value={editingUser.pin || ''} onChange={e => setEditingUser({...editingUser, pin: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Account Role</label>
                      <select className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none font-bold bg-white" value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                         {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                       <Info size={20} className="text-blue-500 shrink-0 mt-1" />
                       <p className="text-[10px] text-blue-800 leading-relaxed font-bold">Roles are descriptive. You must manually select the checkboxes below to grant actual permissions.</p>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">Module Permissions / سسٹم کی اجازتیں</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {AVAILABLE_PERMISSIONS.map(perm => {
                          const isChecked = editingUser.permissions?.includes(perm.id);
                          return (
                            <button 
                              key={perm.id}
                              onClick={() => togglePermission(perm.id)}
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${isChecked ? 'border-primary bg-red-50 ring-4 ring-red-50/50' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                            >
                               <div>
                                  <p className={`font-bold text-sm ${isChecked ? 'text-primary' : 'text-gray-700'}`}>{perm.label}</p>
                                  <p className="text-[10px] font-urdu text-gray-400">{perm.urdu}</p>
                               </div>
                               {isChecked ? <CheckSquare size={24} className="text-primary fill-red-100" /> : <Square size={24} className="text-gray-200" />}
                            </button>
                          );
                       })}
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-gray-50 border-t flex gap-4">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-5 text-gray-500 font-bold hover:bg-gray-200 rounded-3xl transition-all">Cancel</button>
                 <button onClick={handleSaveUser} className="flex-[2] bg-primary text-white py-5 rounded-3xl font-black text-lg hover:bg-red-800 shadow-2xl shadow-red-200 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]">
                    <Save size={24}/> Commit User Update
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({size, className}: {size: number, className: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default SettingsView;
import React, { useState, useRef } from 'react';
import { PersistenceService } from '../services/persistenceService';
import { 
  Database, Download, Upload, AlertTriangle, RefreshCw, CheckCircle, 
  Printer, User as UserIcon, Plus, Trash2, Key, Shield, Edit2, 
  Store, Percent, Eye, EyeOff, Info, Cloud, Loader2, Play, X, UserPlus, Save 
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

  const handleTestDropbox = async () => {
    const token = settings.sync?.dropbox.accessToken?.trim();
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
        showMsg(`Connected as ${data.name.display_name}. Sync enabled!`);
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
    showMsg('Backup file downloaded.');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = PersistenceService.restoreBackup(event.target?.result as string);
      if (success) {
        showMsg('Database restored. Reloading data...');
        setTimeout(() => onDataReset(), 1000);
      } else {
        showMsg('Invalid backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('CRITICAL: This will delete all orders, expenses, and inventory. This cannot be undone. Are you sure?')) {
      const pin = prompt('Enter Master Admin PIN to confirm:');
      if (pin === '1234' || pin === '9221') {
        PersistenceService.clearDatabase();
        showMsg('Database cleared successfully.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert('Incorrect PIN. Action cancelled.');
      }
    }
  };

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.pin) return;
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
    showMsg('User updated successfully.');
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10">
        <Shield size={64} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold">Admin Access Required</h2>
        <p className="text-gray-500 font-urdu mt-2">ترتیبات تک رسائی کے لیے ایڈمن ہونا ضروری ہے۔</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-surface flex flex-col no-scrollbar">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <span className="font-urdu text-lg text-gray-500">سسٹم کی ترتیبات</span>
        </div>
      </div>

      {statusMsg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in border shadow-sm ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-bold">{statusMsg.text}</span>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b overflow-x-auto no-scrollbar">
        {[
          { id: 'GENERAL', label: 'General', icon: Store },
          { id: 'USERS', label: 'Users & Staff', icon: UserIcon },
          { id: 'PRINTER', label: 'Printer', icon: Printer },
          { id: 'CLOUD', label: 'Cloud Sync', icon: Cloud },
          { id: 'SYSTEM', label: 'Maintenance', icon: Database },
          { id: 'ABOUT', label: 'About', icon: Info },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary border-b-4 border-primary shadow-sm' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'GENERAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4"><Store size={20} className="text-primary"/> Store Branding</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Restaurant Name</label>
                  <input className="w-full border rounded-xl p-3 focus:border-primary outline-none" value={settings.restaurantName} onChange={e => onUpdateSettings({...settings, restaurantName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Urdu Display Name</label>
                  <input className="w-full border rounded-xl p-3 font-urdu text-right focus:border-primary outline-none" value={settings.restaurantUrduName} onChange={e => onUpdateSettings({...settings, restaurantUrduName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                    <input className="w-full border rounded-xl p-3 focus:border-primary outline-none" value={settings.phone} onChange={e => onUpdateSettings({...settings, phone: e.target.value})} />
                   </div>
                   <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Currency</label>
                    <input className="w-full border rounded-xl p-3 focus:border-primary outline-none" value={settings.currencySymbol} onChange={e => onUpdateSettings({...settings, currencySymbol: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
                  <textarea className="w-full border rounded-xl p-3 resize-none focus:border-primary outline-none" rows={2} value={settings.address} onChange={e => onUpdateSettings({...settings, address: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4"><Percent size={20} className="text-primary"/> Billing & Tax</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">GST Rate (%)</label>
                    <input type="number" className="w-full border rounded-xl p-3 text-xl font-bold focus:border-primary outline-none" value={settings.taxRate} onChange={e => onUpdateSettings({...settings, taxRate: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Service Charge (%)</label>
                    <input type="number" className="w-full border rounded-xl p-3 text-xl font-bold focus:border-primary outline-none" value={settings.serviceChargeRate} onChange={e => onUpdateSettings({...settings, serviceChargeRate: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Receipt Footer Note</label>
                  <input className="w-full border rounded-xl p-3 focus:border-primary outline-none" value={settings.receiptFooter} onChange={e => onUpdateSettings({...settings, receiptFooter: e.target.value})} />
                </div>
                <button onClick={() => showMsg('Settings saved successfully.')} className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-200">Save General Settings</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                  <p className="text-sm text-gray-500">Manage staff access and security PINs.</p>
                </div>
                <button onClick={() => setEditingUser({ role: UserRole.CASHIER, permissions: ['ACCESS_POS'] })} className="bg-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700">
                  <UserPlus size={18} /> Add New User
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <div key={user.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col relative group">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500"><UserIcon size={24}/></div>
                       <div>
                          <h3 className="font-bold text-gray-800">{user.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-red-50 px-2 py-0.5 rounded">{user.role}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 p-2 rounded-lg">
                       <Key size={14}/> PIN: <span className="font-mono font-bold text-gray-800">****</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => setEditingUser(user)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                        <Edit2 size={14}/> Edit
                      </button>
                      <button 
                        onClick={() => { if(confirm(`Delete user ${user.name}?`)) onUpdateUsers(users.filter(u => u.id !== user.id)) }}
                        className="p-2 text-red-300 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'PRINTER' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-xl animate-fade-in">
             <h2 className="text-xl font-bold mb-8 flex items-center gap-2 border-b pb-4"><Printer size={20} className="text-primary"/> Printer Configuration</h2>
             <div className="space-y-8">
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase block mb-4">Paper Width</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => onUpdatePrinter({...printerConfig, paperWidth: '58mm'})} className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${printerConfig.paperWidth === '58mm' ? 'border-primary bg-red-50 text-primary shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}>
                         <span className="text-2xl font-bold">58mm</span>
                         <span className="text-[10px] font-bold uppercase">Small Receipt</span>
                      </button>
                      <button onClick={() => onUpdatePrinter({...printerConfig, paperWidth: '80mm'})} className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${printerConfig.paperWidth === '80mm' ? 'border-primary bg-red-50 text-primary shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}>
                         <span className="text-2xl font-bold">80mm</span>
                         <span className="text-[10px] font-bold uppercase">Standard / Wide</span>
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <div>
                      <p className="font-bold text-gray-800">Auto Print on Checkout</p>
                      <p className="text-xs text-gray-500">Automatically open print dialog after every order.</p>
                   </div>
                   <button 
                    onClick={() => onUpdatePrinter({...printerConfig, autoPrint: !printerConfig.autoPrint})}
                    className={`w-14 h-8 rounded-full relative transition-colors ${printerConfig.autoPrint ? 'bg-primary' : 'bg-gray-300'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${printerConfig.autoPrint ? 'left-7' : 'left-1 shadow-sm'}`} />
                   </button>
                </div>

                <button onClick={() => showMsg('Printer settings updated.')} className="w-full py-4 bg-secondary text-white rounded-2xl font-bold hover:bg-slate-700">Save Printer Settings</button>
             </div>
          </div>
        )}

        {activeTab === 'CLOUD' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Cloud size={28} /></div>
              <div><h2 className="text-xl font-bold">Dropbox Cloud Sync</h2><p className="text-sm text-gray-500">Securely back up your database to your personal Dropbox.</p></div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Dropbox Access Token</label>
                <div className="relative">
                  <input type="password" placeholder="sl.xxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full border rounded-xl p-4 font-mono text-xs focus:border-blue-400 outline-none pr-12" value={settings.sync?.dropbox.accessToken || ''} onChange={e => onUpdateSettings({...settings, sync: { ...settings.sync, dropbox: { accessToken: e.target.value } } as any})} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Cloud size={18}/></div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleTestDropbox} disabled={isConnecting} className="flex-1 bg-white border-2 border-blue-100 text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-50 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                  {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />} Test Connection
                </button>
                <button onClick={() => showMsg('Sync settings saved.')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Save Config</button>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-800 flex gap-3">
                 <Info size={16} className="shrink-0" />
                 <div>
                    <p className="font-bold mb-1">How to get a token?</p>
                    <p>Go to Dropbox App Console, create an app with "files.content.write/read" permissions, and generate a temporary access token.</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Database size={20} className="text-primary"/> Data Backup & Restore</h2>
                <div className="space-y-4">
                   <button onClick={handleBackup} className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Download size={20} className="text-green-600" />
                        <span className="font-bold">Backup Database</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                   </button>
                   <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Upload size={20} className="text-blue-600" />
                        <span className="font-bold">Restore from File</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleRestore} />
                </div>
             </div>

             <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
                <h2 className="text-lg font-bold text-red-800 mb-6 flex items-center gap-2"><AlertTriangle size={20}/> Danger Zone</h2>
                <p className="text-sm text-red-600 mb-6 font-medium">Resetting the database will permanently delete all records. Ensure you have a backup first.</p>
                <button onClick={handleClearData} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                   <Trash2 size={18} /> Clear All Data
                </button>
             </div>
          </div>
        )}
        
        {activeTab === 'ABOUT' && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border shadow-sm animate-fade-in">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                 <Store size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">ShinwariPOS <span className="text-primary">ERP</span></h2>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-8">Professional Restaurant Management Suite</p>
              
              <div className="grid grid-cols-2 gap-8 text-center mb-8">
                 <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Version</p>
                    <p className="font-bold text-gray-800">1.6.2 Stable</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Architecture</p>
                    <p className="font-bold text-gray-800">SPA + PWA</p>
                 </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl text-center border">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">Designed & Developed by</p>
                  <p className="text-xl font-black text-gray-800">Rana Rashid Rashid</p>
                  <p className="text-primary font-bold mt-1">Contact: 0300-4097479</p>
              </div>
          </div>
        )}
      </div>

      {/* USER EDITOR MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                 <h3 className="text-xl font-bold">{editingUser.id ? 'Edit Staff User' : 'New Staff User'}</h3>
                 <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Display Name</label>
                    <input className="w-full border rounded-xl p-3 focus:border-primary outline-none font-bold" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Access PIN</label>
                      <input className="w-full border rounded-xl p-3 focus:border-primary outline-none font-mono text-xl text-center" maxLength={6} value={editingUser.pin || ''} onChange={e => setEditingUser({...editingUser, pin: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Role</label>
                      <select className="w-full border rounded-xl p-3 focus:border-primary outline-none font-bold" value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                         {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium italic">Note: Permissions are automatically assigned based on the selected role.</p>
              </div>
              <div className="p-6 bg-gray-50 border-t flex gap-3">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl">Cancel</button>
                 <button onClick={handleSaveUser} className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-800 shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                    <Save size={18}/> Save User Info
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
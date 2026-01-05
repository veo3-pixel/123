
import React, { useState, useEffect } from 'react';
import { PersistenceService } from '../services/persistenceService';
import { Database, Download, Upload, AlertTriangle, RefreshCw, CheckCircle, Printer, User as UserIcon, Plus, Trash2, Key, Shield, Edit2, Store, Percent, Eye, EyeOff, Info, Cloud, Loader2, Play } from 'lucide-react';
import { User, PrinterConfig, UserRole, Permission, SystemSettings } from '../types';

interface SettingsViewProps {
  currentUser: User;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SYSTEM' | 'CLOUD' | 'PRINTER' | 'USERS' | 'ABOUT'>('GENERAL');
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(PersistenceService.getSettings());
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(PersistenceService.getPrinterConfig());
  const [isConnecting, setIsConnecting] = useState(false);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSaveSettings = () => {
      PersistenceService.saveSettings(settings);
      showMsg('System settings saved successfully.');
  };

  const handleTestDropbox = async () => {
      const token = settings.sync?.dropbox.accessToken?.trim().replace(/^Bearer\s+/i, '');
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
              PersistenceService.saveSettings({ ...settings, sync: { ...settings.sync, enabled: true, dropbox: { accessToken: token } } as any });
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

  return (
    <div className="p-6 h-full overflow-y-auto bg-surface flex flex-col">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                System Settings
                <Database size={24} className="text-gray-400" />
            </h1>
            <span className="font-urdu text-lg text-gray-500">سسٹم کی ترتیبات</span>
        </div>

        {statusMsg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                <span className="font-bold">{statusMsg.text}</span>
            </div>
        )}

        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
           {['GENERAL', 'USERS', 'PRINTER', 'CLOUD', 'SYSTEM', 'ABOUT'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
               >
                 {tab.charAt(0) + tab.slice(1).toLowerCase()}
               </button>
           ))}
        </div>

        <div className="flex-1">
          {activeTab === 'GENERAL' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Store size={20} className="text-primary"/> Details</h2>
                      <div className="space-y-4">
                          <input className="w-full border rounded-lg p-2.5" placeholder="Name" value={settings.restaurantName} onChange={e => setSettings({...settings, restaurantName: e.target.value})} />
                          <input className="w-full border rounded-lg p-2.5 font-urdu text-right" placeholder="Urdu Name" value={settings.restaurantUrduName} onChange={e => setSettings({...settings, restaurantUrduName: e.target.value})} />
                          <input className="w-full border rounded-lg p-2.5" placeholder="Phone" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                          <textarea className="w-full border rounded-lg p-2.5 resize-none" placeholder="Address" rows={2} value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                      <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Percent size={20} className="text-primary"/> Financials</h2>
                      <div className="space-y-4">
                          <div className="flex gap-4">
                              <div className="flex-1"><label className="text-xs font-bold text-gray-400">GST %</label><input type="number" className="w-full border rounded-lg p-2.5" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: Number(e.target.value)})} /></div>
                              <div className="flex-1"><label className="text-xs font-bold text-gray-400">Service %</label><input type="number" className="w-full border rounded-lg p-2.5" value={settings.serviceChargeRate} onChange={e => setSettings({...settings, serviceChargeRate: Number(e.target.value)})} /></div>
                          </div>
                          <button onClick={handleSaveSettings} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-800 shadow-lg">Save Settings</button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'CLOUD' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Cloud size={24} /></div>
                      <div><h2 className="text-lg font-bold">Dropbox Sync</h2><p className="text-sm text-gray-500">Auto-sync database to cloud.</p></div>
                  </div>
                  <div className="space-y-4">
                      <input type="password" placeholder="Access Token" className="w-full border rounded-lg p-3 font-mono text-xs" value={settings.sync?.dropbox.accessToken || ''} onChange={e => setSettings({...settings, sync: { ...settings.sync, dropbox: { accessToken: e.target.value } } as any})} />
                      <div className="flex gap-3">
                          <button onClick={handleTestDropbox} disabled={isConnecting} className="flex-1 bg-white border text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                              {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />} Test & Connect
                          </button>
                          <button onClick={handleSaveSettings} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-800">Save</button>
                      </div>
                  </div>
              </div>
          )}
          
          {activeTab === 'ABOUT' && (
              <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                       <Info size={48} className="mx-auto text-primary mb-4"/>
                       <h2 className="text-2xl font-bold">Subhan Khan Shinwari Dera POS</h2>
                       <p className="text-gray-500">Version 1.5.0 - Professional ERP</p>
                       <p className="text-primary font-bold mt-4">Dev: Rana Rashid Rashid (0300-4097479)</p>
                  </div>
              </div>
          )}
        </div>
    </div>
  );
};

export default SettingsView;

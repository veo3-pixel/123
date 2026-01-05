
import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Package, 
  FileText, 
  Settings, 
  LogOut, 
  Wallet, 
  LayoutList
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', urdu: 'ڈیش بورڈ', icon: LayoutDashboard, permission: 'VIEW_DASHBOARD' },
    { id: 'pos', label: 'POS Terminal', urdu: 'پوائنٹ آف سیل', icon: UtensilsCrossed, permission: 'ACCESS_POS' },
    { id: 'kitchen', label: 'Kitchen KDS', urdu: 'کچن اسکرین', icon: ChefHat, permission: 'ACCESS_KITCHEN' },
    { id: 'inventory', label: 'Inventory', urdu: 'اسٹاک', icon: Package, permission: 'MANAGE_INVENTORY' },
    { id: 'expenses', label: 'Finance & HR', urdu: 'اخراجات', icon: Wallet, permission: 'MANAGE_EXPENSES' },
    { id: 'menu', label: 'Menu Editor', urdu: 'مینو ایڈیٹر', icon: FileText, permission: 'MANAGE_MENU' },
    { id: 'reports', label: 'Reports', urdu: 'رپورٹ', icon: LayoutList, permission: 'VIEW_REPORTS' },
    { id: 'settings', label: 'Settings', urdu: 'ترتیبات', icon: Settings, permission: 'MANAGE_SETTINGS' },
  ];

  const filteredMenu = menuItems.filter(item => 
    currentUser.permissions.includes(item.permission as any)
  );

  return (
    <aside className="w-20 lg:w-64 bg-secondary h-screen flex flex-col transition-all duration-300 z-[100] shadow-2xl shrink-0">
      <div className="h-20 flex items-center gap-3 px-4 lg:px-6 bg-slate-900/50">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
          <UtensilsCrossed size={20} />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h1 className="text-white font-bold text-sm whitespace-nowrap">SHINWARI POS</h1>
          <p className="text-primary text-[10px] font-urdu leading-none">سبحان خان شنواری</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex flex-col lg:flex-row items-center gap-3 p-3 rounded-xl transition-all group ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-primary'} />
            <div className="hidden lg:flex flex-col items-start leading-none">
              <span className="text-sm font-bold">{item.label}</span>
              <span className={`text-[10px] font-urdu mt-1 ${activeTab === item.id ? 'text-red-100' : 'text-slate-500'}`}>{item.urdu}</span>
            </div>
          </button>
        ))}
      </nav>

      <div className="p-4 bg-slate-900/30 border-t border-slate-700/50">
        <button onClick={onLogout} className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group">
          <LogOut size={22} />
          <span className="hidden lg:block font-bold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

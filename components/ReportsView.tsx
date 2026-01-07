
import React, { useState } from 'react';
import { Order, Expense, Purchase, OrderStatus, User, UserRole } from '../types';
import { Calendar, DollarSign, TrendingDown, TrendingUp, ShoppingCart, Truck, Download, Lock, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface ReportsViewProps {
  currentUser: User;
  orders: Order[];
  expenses: Expense[];
  purchases: Purchase[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const ReportsView: React.FC<ReportsViewProps> = ({ currentUser, orders, expenses, purchases }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'SALES' | 'EXPENSE' | 'PURCHASE' | 'PNL'>(isAdmin ? 'PNL' : 'SALES');
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL'>('MONTH');
  
  const getFilteredData = <T extends unknown>(data: T[]): T[] => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      return data.filter((item: any) => {
          const date = item.timestamp || item.date;
          if (!date) return false;
          const d = new Date(date);
          
          switch (dateRange) {
              case 'TODAY': return d >= todayStart;
              case 'WEEK': return d >= weekStart;
              case 'MONTH': return d >= monthStart;
              case 'YEAR': return d >= yearStart;
              default: return true;
          }
      });
  };

  const filteredOrders = getFilteredData<Order>(orders.filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED && o.status !== OrderStatus.HELD));
  const filteredExpenses = getFilteredData<Expense>(expenses);
  const filteredPurchases = getFilteredData<Purchase>(purchases);

  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const netProfit = totalSales - totalExpenses - totalPurchases;

  const getDailyData = () => {
      const map = new Map<string, {sales: number, expenses: number, purchases: number}>();
      const addToMap = (date: Date, key: 'sales' | 'expenses' | 'purchases', amount: number) => {
          const d = date.toISOString().split('T')[0];
          const curr = map.get(d) || {sales: 0, expenses: 0, purchases: 0};
          curr[key] += amount;
          map.set(d, curr);
      };
      filteredOrders.forEach(o => addToMap(o.timestamp, 'sales', o.total));
      filteredExpenses.forEach(e => addToMap(new Date(e.date), 'expenses', e.amount));
      filteredPurchases.forEach(p => addToMap(new Date(p.date), 'purchases', p.totalCost));
      return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, vals]) => ({ date, ...vals }));
  };

  const handleExportCSV = () => {
      let csvContent = "";
      
      if (activeTab === 'SALES') {
          csvContent = "Order ID,Date,Type,Customer,Total\n";
          filteredOrders.forEach(o => { 
              csvContent += `${o.orderNumber},"${o.timestamp.toLocaleString()}",${o.type},"${o.customerName || 'Walk-in'}",${o.total}\n`; 
          });
      } else if (activeTab === 'EXPENSE' && isAdmin) {
          csvContent = "Date,Category,Description,Amount\n";
          filteredExpenses.forEach(e => { 
              csvContent += `"${new Date(e.date).toLocaleDateString()}",${e.category},"${e.description.replace(/"/g, '""')}",${e.amount}\n`; 
          });
      } else if (activeTab === 'PURCHASE' && isAdmin) {
          csvContent = "Date,Supplier,Total Cost\n";
          filteredPurchases.forEach(p => {
              csvContent += `"${new Date(p.date).toLocaleDateString()}","${p.supplier}",${p.totalCost}\n`;
          });
      } else if (activeTab === 'PNL' && isAdmin) {
          csvContent = "Date,Sales,Expenses,Purchases,Net Profit\n";
          getDailyData().forEach(row => { 
              const profit = row.sales - row.expenses - row.purchases;
              csvContent += `${row.date},${row.sales},${row.expenses},${row.purchases},${profit}\n`; 
          });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${activeTab}_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-surface overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                <span className="font-urdu text-lg text-gray-500">تفصیلی رپورٹ</span>
            </div>
            <div className="flex gap-4">
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                    {(['TODAY', 'WEEK', 'MONTH', 'YEAR', 'ALL'] as const).map(r => (
                        <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${dateRange === r ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                            {r}
                        </button>
                    ))}
                </div>
                <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm transition-all active:scale-95">
                    <Download size={16}/> Export CSV
                </button>
            </div>
        </div>

        <div className="flex gap-2 border-b mb-6 overflow-x-auto no-scrollbar">
            {[
                { id: 'PNL', label: 'Profit & Loss', icon: DollarSign, restricted: true },
                { id: 'SALES', label: 'Sales Report', icon: TrendingUp, restricted: false },
                { id: 'EXPENSE', label: 'Expense Report', icon: TrendingDown, restricted: true },
                { id: 'PURCHASE', label: 'Purchase Report', icon: ShoppingCart, restricted: true },
            ].filter(tab => !tab.restricted || isAdmin).map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id ? 'border-primary text-primary font-bold bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'PNL' && isAdmin && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg">
                            <p className="text-green-100 text-sm font-bold mb-1">Total Revenue</p>
                            <h3 className="text-3xl font-bold">Rs. {totalSales.toLocaleString()}</h3>
                        </div>
                         <div className="bg-red-500 text-white p-6 rounded-2xl shadow-lg">
                            <p className="text-red-100 text-sm font-bold mb-1">Total Expenses</p>
                            <h3 className="text-3xl font-bold">Rs. {totalExpenses.toLocaleString()}</h3>
                        </div>
                         <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg">
                            <p className="text-orange-100 text-sm font-bold mb-1">Purchases (COGS)</p>
                            <h3 className="text-3xl font-bold">Rs. {totalPurchases.toLocaleString()}</h3>
                        </div>
                        <div className={`p-6 rounded-2xl shadow-lg text-white transition-all ${netProfit >= 0 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                            <p className="text-blue-100 text-sm font-bold mb-1">Net Profit</p>
                            <h3 className="text-3xl font-bold">Rs. {netProfit.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border h-80">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                           <FileText size={18} className="text-primary"/> Financial Trend
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getDailyData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="purchases" name="Purchases" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'SALES' && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-fade-in">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-700">Recent Sales Summary</h3>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredOrders.length} Orders</span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 tracking-wider">
                            <tr>
                                <th className="p-4">Order #</th>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y">
                            {filteredOrders.length > 0 ? filteredOrders.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-primary">#{o.orderNumber}</td>
                                    <td className="p-4 text-gray-600">{o.timestamp.toLocaleString()}</td>
                                    <td className="p-4 text-gray-600">{o.customerName || 'Walk-in'}</td>
                                    <td className="p-4 text-right font-bold text-gray-900">Rs. {o.total.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">No sales found in this range.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'EXPENSE' && isAdmin && (
                 <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-fade-in">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-700">Expense Journal</h3>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total: Rs. {totalExpenses.toLocaleString()}</span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 tracking-wider">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y">
                            {filteredExpenses.length > 0 ? filteredExpenses.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">{e.category}</span></td>
                                    <td className="p-4 text-gray-600 truncate max-w-xs">{e.description}</td>
                                    <td className="p-4 text-right font-bold text-red-600">Rs. {e.amount.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">No expenses recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'PURCHASE' && isAdmin && (
                 <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-fade-in">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-700">Purchase Orders</h3>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total: Rs. {totalPurchases.toLocaleString()}</span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 tracking-wider">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4 text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y">
                            {filteredPurchases.length > 0 ? filteredPurchases.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-gray-700">{p.supplier}</td>
                                    <td className="p-4 text-right font-bold text-orange-600">Rs. {p.totalCost.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="p-10 text-center text-gray-400 italic">No purchases recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};

export default ReportsView;

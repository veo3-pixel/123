
import React, { useState } from 'react';
import { Order, Expense, Purchase, OrderStatus, User, UserRole } from '../types';
import { Calendar, DollarSign, TrendingDown, TrendingUp, ShoppingCart, Truck, Download, Lock } from 'lucide-react';
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

  const categoryExpenseData = () => {
      const map = new Map<string, number>();
      filteredExpenses.forEach(e => map.set(e.category, (map.get(e.category) || 0) + e.amount));
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  };

  const handleExportCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      if (activeTab === 'SALES') {
          csvContent += "Order ID,Date,Type,Total\n";
          filteredOrders.forEach(o => { csvContent += `${o.orderNumber},${o.timestamp.toISOString()},${o.type},${o.total}\n`; });
      } else if (activeTab === 'EXPENSE' && isAdmin) {
          csvContent += "Date,Category,Description,Amount\n";
          filteredExpenses.forEach(e => { csvContent += `${e.date},${e.category},${e.description.replace(/,/g, ' ')},${e.amount}\n`; });
      } else if (activeTab === 'PNL' && isAdmin) {
          csvContent += "Date,Sales,Expenses,Purchases\n";
          getDailyData().forEach(row => { csvContent += `${row.date},${row.sales},${row.expenses},${row.purchases}\n`; });
      }
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${activeTab}_Report.csv`);
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
                <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm">
                    <Download size={16}/> Export CSV
                </button>
            </div>
        </div>

        <div className="flex gap-2 border-b mb-6 overflow-x-auto">
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

        <div className="flex-1 overflow-y-auto">
            {activeTab === 'PNL' && isAdmin && (
                <div className="space-y-6">
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
                        <div className={`p-6 rounded-2xl shadow-lg text-white ${netProfit >= 0 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                            <p className="text-blue-100 text-sm font-bold mb-1">Net Profit</p>
                            <h3 className="text-3xl font-bold">Rs. {netProfit.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border h-80">
                        <h3 className="font-bold text-gray-700 mb-4">Financial Trend</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getDailyData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sales" name="Sales" fill="#10b981" />
                                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                                <Bar dataKey="purchases" name="Purchases" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'SALES' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="font-bold text-gray-700 mb-4">Sales Breakdown</h3>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr><th className="p-3">Order #</th><th className="p-3">Date</th><th className="p-3 text-right">Amount</th></tr>
                        </thead>
                        <tbody className="text-sm divide-y">
                            {filteredOrders.map(o => (
                                <tr key={o.id}><td className="p-3 font-mono">#{o.orderNumber}</td><td className="p-3">{o.timestamp.toLocaleDateString()}</td><td className="p-3 text-right font-bold">Rs. {o.total}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};

export default ReportsView;

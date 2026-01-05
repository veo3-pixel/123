
import React from 'react';
import { Order, OrderStatus, Purchase, Expense, User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Printer, Wallet, Lock } from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  orders: Order[];
  purchases: Purchase[];
  expenses: Expense[];
  onRefundOrder?: (orderId: string) => void;
  onPrintReceipt: (order: Order) => void;
}

const COLORS = ['#b91c1c', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, orders, purchases = [], expenses = [], onRefundOrder, onPrintReceipt }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED);
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCost = (purchases?.reduce((sum, p) => sum + p.totalCost, 0) || 0) + (expenses?.reduce((sum, e) => sum + e.amount, 0) || 0);
  const netProfit = totalRevenue - totalCost;

  const pieData = Array.from(validOrders.reduce((map, o) => {
    o.items.forEach(i => map.set(i.category, (map.get(i.category) || 0) + i.quantity));
    return map;
  }, new Map<string, number>())).map(([name, value]) => ({ name, value }));

  const StatCard = ({ title, urduTitle, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
           <p className="text-gray-500 text-sm font-medium">{title}</p>
           <p className="text-gray-400 text-sm font-urdu">{urduTitle}</p>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}><Icon className={color.replace('bg-', 'text-')} size={24} /></div>
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto bg-surface">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Business Dashboard</h1><span className="font-urdu text-lg text-gray-500">کاروباری رپورٹ</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin ? (<><StatCard title="Revenue" urduTitle="کل آمدنی" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-600" /><StatCard title="Expenses" urduTitle="کل اخراجات" value={`Rs. ${totalCost.toLocaleString()}`} icon={Wallet} color="bg-red-600" /><StatCard title="Net Profit" urduTitle="منافع" value={`Rs. ${netProfit.toLocaleString()}`} icon={TrendingUp} color={netProfit >= 0 ? "bg-blue-600" : "bg-red-500"} /></>) : (<div className="col-span-3 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 gap-2"><Lock size={20} /><span>Restricted Access</span></div>)}
        <StatCard title="Orders" urduTitle="مکمل آرڈر" value={validOrders.length} icon={ShoppingBag} color="bg-orange-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Sales by Category</h3>
            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieData.map((e, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Recent Transactions</h3>
            <div className="overflow-y-auto max-h-64"><table className="w-full text-xs text-left"><tbody className="divide-y">{orders.slice(0, 5).map(o => (<tr key={o.id} className="hover:bg-gray-50"><td className="py-2 font-mono">#{o.orderNumber}</td><td className="py-2">Rs. {o.total}</td><td className="py-2 text-right"><button onClick={() => onPrintReceipt(o)} className="text-primary font-bold"><Printer size={14}/></button></td></tr>))}</tbody></table></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;


import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Staff, AttendanceRecord, AttendanceStatus, SalaryType, User, UserRole } from '../types';
import { Wallet, Plus, Calendar, DollarSign, Lock, Unlock, TrendingDown, Users, CheckSquare, Save, Trash2, UserPlus, FileBarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PersistenceService } from '../services/persistenceService';

interface ExpenseViewProps {
  currentUser: User;
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

const ExpenseView: React.FC<ExpenseViewProps> = ({ currentUser, expenses, onAddExpense, onDeleteExpense }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'EXPENSES' | 'STAFF' | 'ATTENDANCE'>('EXPENSES');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    setStaffList(PersistenceService.getStaff());
    setAttendance(PersistenceService.getAttendance());
  }, []);

  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.MEAT);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({ name: '', role: '', salaryAmount: 0, salaryType: SalaryType.MONTHLY, phone: '' });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if (!amount) return;
      if (category === ExpenseCategory.SALARY && !isAdmin) {
        alert("Only Admin can record salary expenses.");
        return;
      }
      const newExpense: Expense = {
          id: Math.random().toString(36).substr(2, 9),
          category,
          amount: parseFloat(amount),
          description: description || 'Expense',
          date: new Date(date),
          staffId: category === ExpenseCategory.SALARY ? selectedStaffId : undefined
      };
      onAddExpense(newExpense);
      setAmount(''); setDescription(''); setSelectedStaffId('');
  };

  const markAttendance = (staffId: string, status: AttendanceStatus) => {
      if (!isAdmin) return;
      const existingRecordIndex = attendance.findIndex(r => r.staffId === staffId && r.date === attendanceDate);
      const newRecord: AttendanceRecord = {
          id: existingRecordIndex >= 0 ? attendance[existingRecordIndex].id : Math.random().toString(36).substr(2, 9),
          staffId, date: attendanceDate, status
      };
      const updated = existingRecordIndex >= 0 ? attendance.map((r, i) => i === existingRecordIndex ? newRecord : r) : [...attendance, newRecord];
      setAttendance(updated);
      PersistenceService.saveAttendance(updated);
  };

  if (!isAdmin && activeTab !== 'EXPENSES') {
      return (
          <div className="h-full flex flex-col items-center justify-center p-10 bg-gray-50">
              <Lock size={48} className="text-red-400 mb-4" />
              <h2 className="text-xl font-bold">Admin Restricted Area</h2>
              <p className="text-gray-500 font-urdu">حاضری اور سٹاف کی تفصیلات صرف ایڈمن دیکھ سکتا ہے۔</p>
              <button onClick={() => setActiveTab('EXPENSES')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold">Back to Expenses</button>
          </div>
      );
  }

  return (
    <div className="p-6 h-full flex flex-col bg-surface overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Finance & HR</h1>
                <span className="font-urdu text-lg text-gray-500">اخراجات اور عملے کا انتظام</span>
            </div>
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button onClick={() => setActiveTab('EXPENSES')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'EXPENSES' ? 'bg-secondary text-white' : 'text-gray-600'}`}>Expenses</button>
                {isAdmin && <button onClick={() => setActiveTab('STAFF')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'STAFF' ? 'bg-secondary text-white' : 'text-gray-600'}`}>Staff</button>}
                {isAdmin && <button onClick={() => setActiveTab('ATTENDANCE')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ATTENDANCE' ? 'bg-secondary text-white' : 'text-gray-600'}`}>Attendance</button>}
            </div>
        </div>

        {activeTab === 'EXPENSES' && (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8 overflow-y-auto">
                <div className="flex-1 max-w-lg">
                    <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-2 flex items-center gap-2"><Plus size={20} className="text-primary"/> New Expense Entry</h2>
                    <form onSubmit={handleAddExpense} className="space-y-5">
                        <select className="w-full border rounded-xl p-2.5 bg-gray-50 font-bold" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
                            {Object.values(ExpenseCategory).filter(c => c !== ExpenseCategory.SALARY || isAdmin).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="number" className="w-full border rounded-xl p-2.5 bg-gray-50 font-bold text-lg" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <textarea className="w-full border rounded-xl p-2.5 bg-gray-50 h-24 resize-none" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                        <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold">Save Record</button>
                    </form>
                </div>
            </div>
        )}

        {activeTab === 'ATTENDANCE' && isAdmin && (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border p-6 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Mark Daily Attendance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staffList.map(staff => (
                        <div key={staff.id} className="border p-4 rounded-xl bg-gray-50">
                            <h3 className="font-bold">{staff.name}</h3>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => markAttendance(staff.id, AttendanceStatus.PRESENT)} className="flex-1 py-1 bg-green-100 text-green-700 rounded font-bold text-xs">Present</button>
                                <button onClick={() => markAttendance(staff.id, AttendanceStatus.ABSENT)} className="flex-1 py-1 bg-red-100 text-red-700 rounded font-bold text-xs">Absent</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default ExpenseView;


import React, { useState } from 'react';
import { User, UserRole, Permission } from '../types';
import { Lock, UtensilsCrossed, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // --- MASTER PASSWORD / GOD MODE (9221) ---
    if (pin === '9221') {
         // Define ALL permissions explicitly to ensure God Mode
         const ALL_PERMISSIONS: Permission[] = [
            'VIEW_DASHBOARD', 
            'VIEW_REPORTS', 
            'MANAGE_INVENTORY', 
            'MANAGE_MENU', 
            'MANAGE_EXPENSES', 
            'MANAGE_SETTINGS', 
            'PROCESS_REFUND', 
            'ADJUST_STOCK', 
            'ACCESS_POS', 
            'ACCESS_KITCHEN'
         ];

         // Check if a specific "admin" user exists in DB to preserve their Name/ID
         const existingAdmin = users.find(u => u.id === 'admin') || users.find(u => u.role === UserRole.ADMIN);

         // Create a session object that overrides any stored restrictions
         const godUser: User = {
             id: existingAdmin ? existingAdmin.id : 'master-root',
             name: existingAdmin ? existingAdmin.name : 'Master Controller',
             pin: '9221', 
             role: UserRole.ADMIN,
             permissions: ALL_PERMISSIONS // Force all permissions
         };

         onLogin(godUser);
         return;
    }

    // Standard User Login
    const user = users.find(u => u.pin === pin);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-red-500 to-accent"></div>

        <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-900/30">
               <UtensilsCrossed size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Subhan Khan POS</h1>
            <p className="text-gray-500 font-urdu mt-1">سبحان خان شنواری ڈیرہ</p>
        </div>

        <div className="mb-6">
           <div className="flex justify-center mb-4 h-8 items-center">
               {pin === '9221' ? (
                   <span className="text-green-600 font-bold flex items-center gap-2 animate-pulse">
                       <ShieldCheck size={20}/> GOD MODE ACTIVE
                   </span>
               ) : (
                   Array.from({length: 4}).map((_, i) => (
                       <div key={i} className={`w-4 h-4 rounded-full mx-2 border-2 transition-all duration-200 ${i < pin.length ? 'bg-primary border-primary scale-110' : 'border-gray-300'}`} />
                   ))
               )}
           </div>
           {error && <p className="text-red-500 text-center font-bold text-sm animate-pulse">{error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
               <button 
                key={num}
                onClick={() => handleDigit(num.toString())}
                className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-800 transition-colors shadow-sm active:shadow-inner active:scale-95"
               >
                   {num}
               </button>
           ))}
           <button onClick={() => setPin('')} className="h-16 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors shadow-sm active:scale-95">C</button>
           <button onClick={() => handleDigit('0')} className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-800 transition-colors shadow-sm active:scale-95">0</button>
           <button onClick={handleBackspace} className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors shadow-sm active:scale-95">⌫</button>
        </div>

        <button 
            onClick={() => handleSubmit()}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-red-800 transition-colors shadow-lg shadow-primary/30 flex justify-center items-center gap-2 active:scale-[0.98]"
        >
            <Lock size={20} /> Login
        </button>

      </div>
    </div>
  );
};

export default LoginView;

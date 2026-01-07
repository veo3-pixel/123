import React, { useRef, useState } from 'react';
import { Order, SystemSettings, PrinterConfig } from '../types';
import { Receipt } from './Receipt';
import { KitchenReceipt } from './KitchenReceipt';
import { Printer, Download, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
  order: Order | null;
  settings: SystemSettings;
  printerConfig: PrinterConfig;
  mode: 'RECEIPT' | 'KOT';
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, settings, printerConfig, mode, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveImage = async () => {
    if (!receiptRef.current) return;
    setIsSaving(true);
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `Bill-${order.orderNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to save image", err);
    } finally {
      setIsSaving(false);
    }
  };

  const modalWidth = printerConfig.paperWidth === '80mm' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden w-full ${modalWidth} animate-scale-up`}>
        
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">
            {mode === 'RECEIPT' ? 'Final Bill' : 'Kitchen KOT'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center no-scrollbar">
          <div ref={receiptRef} className="shadow-lg bg-white h-fit">
            {mode === 'RECEIPT' ? <Receipt order={order} /> : <KitchenReceipt order={order} />}
          </div>
        </div>

        <div className="p-4 border-t bg-white flex gap-3">
          <button onClick={handlePrint} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-red-800 flex justify-center items-center gap-2 shadow-lg">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleSaveImage} disabled={isSaving} className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-slate-700 flex justify-center items-center gap-2 shadow-lg">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Save PNG
          </button>
        </div>
      </div>
    </div>
  );
};
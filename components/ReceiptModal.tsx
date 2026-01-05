
import React, { useRef, useState, useEffect } from 'react';
import { Order } from '../types';
import { Receipt } from './Receipt';
import { KitchenReceipt } from './KitchenReceipt';
import { Printer, Download, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { PersistenceService } from '../services/persistenceService';

interface ReceiptModalProps {
  order: Order | null;
  mode: 'RECEIPT' | 'KOT';
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, mode, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalWidth, setModalWidth] = useState('max-w-md');

  // Adjust modal width based on printer config
  useEffect(() => {
      const config = PersistenceService.getPrinterConfig();
      if(config && config.paperWidth === '80mm') {
          setModalWidth('max-w-lg'); 
      }
  }, []);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveImage = async () => {
    if (!receiptRef.current) return;
    setIsSaving(true);
    
    try {
      // Clone the element to ensure we capture the full height without scrollbar interference
      const originalElement = receiptRef.current;
      const clone = originalElement.cloneNode(true) as HTMLElement;
      
      // Setup clone styling to ensure full visibility off-screen
      clone.style.position = 'fixed';
      clone.style.left = '-10000px';
      clone.style.top = '0';
      clone.style.zIndex = '-1000';
      clone.style.height = 'auto'; // Let it grow
      clone.style.width = originalElement.offsetWidth + 'px'; // Maintain original width
      clone.style.overflow = 'visible'; // Ensure no internal scrolling
      
      // Append to body
      document.body.appendChild(clone);
      
      // Small delay to ensure rendering of the clone
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight
      });
      
      // Remove clone
      document.body.removeChild(clone);

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Bill-${order.orderNumber}-${dateStr}.png`;
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to save receipt image", err);
      alert("Failed to save image");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden w-full ${modalWidth} animate-scale-up`}>
        
        {/* Header Controls */}
        <div id="receipt-modal-controls" className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {mode === 'RECEIPT' ? 'Print Receipt' : 'Kitchen Ticket'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center">
          <div id="receipt-content" ref={receiptRef} className="shadow-lg bg-white h-fit">
            {mode === 'RECEIPT' ? <Receipt order={order} /> : <KitchenReceipt order={order} />}
          </div>
        </div>

        {/* Footer Actions */}
        <div id="receipt-modal-controls" className="p-4 border-t bg-white flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-red-800 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-red-200"
          >
            <Printer size={18} /> Print Bill
          </button>
          
          <button 
            onClick={handleSaveImage}
            disabled={isSaving}
            className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex justify-center items-center gap-2 shadow-lg"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Save Image
          </button>
        </div>

      </div>
    </div>
  );
};

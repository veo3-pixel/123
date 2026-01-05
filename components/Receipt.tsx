
import React, { useEffect, useState } from 'react';
import { Order, OrderType, PrinterConfig, SystemSettings } from '../types';
import { PersistenceService } from '../services/persistenceService';

interface ReceiptProps {
  order: Order | null;
}

export const Receipt: React.FC<ReceiptProps> = ({ order }) => {
  const [config, setConfig] = useState<PrinterConfig | null>(null);
  // Fixed: PersistenceService.getPosSettings() was changed to getSettings() to match the service definition.
  const [settings, setSettings] = useState<SystemSettings>(PersistenceService.getSettings());

  useEffect(() => {
    setConfig(PersistenceService.getPrinterConfig());
    // Fixed: PersistenceService.getPosSettings() was changed to getSettings() to match the service definition.
    setSettings(PersistenceService.getSettings());
  }, []);

  if (!order || !config) return null;

  const widthClass = config.paperWidth === '80mm' ? 'w-[80mm]' : 'w-[58mm]';
  const fontSize = config.paperWidth === '80mm' ? 'text-xs' : 'text-[10px]';

  // Backward compatibility calculation if fields are missing in old orders
  const subtotal = order.subtotal || order.items.reduce((sum, item) => {
      const addonCost = (item.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
      return sum + ((item.price + addonCost) * item.quantity);
  }, 0);
  
  const tax = order.taxAmount ?? (subtotal * 0.16);
  const total = order.total;
  const discount = order.discountAmount || 0;
  const service = order.serviceChargeAmount || 0;

  return (
    <div className={`${widthClass} bg-white text-black p-2 font-mono ${fontSize} leading-tight`}>
      <div className="flex flex-col items-center mb-2">
        {/* Receipt Logo - Greyscale filter for thermal printing optimization */}
        <img 
          src="/logo.png" 
          alt={settings.restaurantName} 
          className="w-24 mb-1 grayscale object-contain"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
        <h1 className="text-sm font-bold uppercase mt-1 text-center leading-tight">
            {settings.restaurantName}
        </h1>
        {settings.restaurantUrduName && (
             <p className="text-[12px] font-urdu font-bold text-center">{settings.restaurantUrduName}</p>
        )}
        <p className="text-[10px] font-bold mt-1 text-center whitespace-pre-wrap">{settings.address}</p>
        <p className="text-[10px]">Tel: {settings.phone}</p>
      </div>

      <div className="border-b border-black mb-2 pb-1 border-dashed">
        <div className="flex justify-between font-bold text-lg mb-1">
          <span>Order No:</span>
          <span>#{order.orderNumber}</span>
        </div>
        
        <div className="flex justify-between font-bold">
            <span>Type:</span>
            <span>{order.type}</span>
        </div>
        
        {order.type === OrderType.DINE_IN && order.tableNumber && (
            <div className="flex justify-between">
                <span>Table:</span>
                <span>{order.tableNumber}</span>
            </div>
        )}
        
        {(order.customerName || order.customerPhone) && (
            <div className="mt-1 pt-1 border-t border-gray-400 border-dashed">
                {order.customerName && <div className="truncate">Cust: {order.customerName}</div>}
                {order.customerPhone && <div>Ph: {order.customerPhone}</div>}
                {order.deliveryAddress && <div className="text-[8px] leading-tight mt-0.5">{order.deliveryAddress}</div>}
            </div>
        )}

        <div className="flex justify-between mt-1">
          <span>Date:</span>
          <span>{order.timestamp.toLocaleDateString()} {order.timestamp.toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.cashierName || 'Admin'}</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex font-bold border-b border-black mb-1 pb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Amt</span>
        </div>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex flex-col mb-1 border-b border-gray-200 border-dashed pb-1">
             <div className="flex">
                <div className="w-1/2 flex flex-col">
                <span>{item.name}</span>
                {item.urduName && <span className="font-urdu text-[8px]">{item.urduName}</span>}
                {item.selectedVariation && <span className="text-[8px] italic">({item.selectedVariation.name})</span>}
                </div>
                <span className="w-1/4 text-center">{item.quantity}</span>
                <span className="w-1/4 text-right">{((item.price + (item.selectedAddons?.reduce((s,a)=>s+a.price,0)||0) + (item.selectedVariation?.price || 0) - item.price ) * item.quantity).toFixed(0)}</span>
             </div>
             {item.selectedAddons && item.selectedAddons.length > 0 && (
                 <div className="text-[8px] pl-2 text-gray-600">
                     {item.selectedAddons.map(a => `+ ${a.name}`).join(', ')}
                 </div>
             )}
          </div>
        ))}
      </div>

      <div className="border-t border-black pt-1 mb-2 border-dashed">
        <div className="flex justify-between font-bold">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(0)}</span>
        </div>
        
        {discount > 0 && (
            <div className="flex justify-between">
                <span>Discount:</span>
                <span>- {discount.toFixed(0)}</span>
            </div>
        )}

        <div className="flex justify-between">
          <span>GST ({settings.taxRate}%):</span>
          <span>{tax.toFixed(0)}</span>
        </div>

        {service > 0 && (
             <div className="flex justify-between">
                <span>Service ({settings.serviceChargeRate}%):</span>
                <span>{service.toFixed(0)}</span>
            </div>
        )}

        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL:</span>
          <span>{settings.currencySymbol} {total.toFixed(0)}</span>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="font-bold">{settings.receiptFooter || 'THANK YOU!'}</p>
        <p className="font-urdu">شکریہ!</p>
        <p className="mt-2 text-[8px]">Powered by ShinwariPOS</p>
      </div>
    </div>
  );
};

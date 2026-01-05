import React from 'react';
import { Order, OrderType } from '../types';

interface KitchenReceiptProps {
  order: Order | null;
}

export const KitchenReceipt: React.FC<KitchenReceiptProps> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="w-[80mm] bg-white text-black p-4 font-mono leading-tight">
      {/* Header */}
      <div className="border-b-4 border-black pb-4 mb-4 text-center">
        <h1 className="text-2xl font-bold uppercase">KITCHEN TICKET</h1>
        <h2 className="text-3xl font-urdu font-bold mt-2">باورچی خانہ</h2>
      </div>

      {/* Order Info */}
      <div className="flex justify-between items-start mb-4 font-bold text-lg">
        <div>
          <span className="block">#{order.orderNumber}</span>
          <span className="block text-sm font-normal">{order.timestamp.toLocaleTimeString()}</span>
        </div>
        <div className="text-right">
            <span className="block px-2 py-1 bg-black text-white rounded">
                {order.type === OrderType.DINE_IN ? 'DINE-IN' : order.type}
            </span>
            {order.tableNumber && (
                <span className="block text-2xl mt-1">Table: {order.tableNumber}</span>
            )}
        </div>
      </div>

      {/* Customer / Delivery Info if relevant */}
      {(order.type !== OrderType.DINE_IN && order.customerName) && (
          <div className="border-b border-black pb-2 mb-2">
              <p className="font-bold">Cust: {order.customerName}</p>
          </div>
      )}

      {/* Items */}
      <div className="space-y-4 mb-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="border-b border-dashed border-gray-400 pb-3">
            <div className="flex items-start gap-4">
              <span className="text-3xl font-bold w-12 pt-1">{item.quantity}</span>
              <div className="flex-1">
                {/* Large Urdu Name */}
                {item.urduName && (
                    <p className="text-3xl font-urdu font-bold leading-normal mb-1 text-right">{item.urduName}</p>
                )}
                {/* English Name */}
                <p className="text-lg font-bold">{item.name}</p>
                
                {/* Addons */}
                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <div className="mt-1 pl-2 border-l-2 border-black">
                    {item.selectedAddons.map((addon, aIdx) => (
                      <p key={aIdx} className="text-sm font-bold">+ {addon.name}</p>
                    ))}
                  </div>
                )}
                
                {/* Item Notes */}
                {item.notes && (
                    <p className="mt-1 font-bold italic text-sm">** {item.notes} **</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen Note */}
      {order.kitchenNote && (
        <div className="border-4 border-black p-2 text-center mb-4">
          <p className="font-bold uppercase text-lg underline">NOTE:</p>
          <p className="text-xl font-bold">{order.kitchenNote}</p>
        </div>
      )}

      <div className="text-center text-xs mt-4">
        Printed: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
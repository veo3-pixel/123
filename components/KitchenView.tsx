
import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, KitchenStation } from '../types';
import { Clock, CheckCircle, Edit3, Utensils, ShoppingBag, Bike, Printer, Filter } from 'lucide-react';

interface KitchenViewProps {
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onEditOrder: (order: Order) => void;
  onPrintKOT: (order: Order) => void;
}

const KitchenView: React.FC<KitchenViewProps> = ({ orders, updateOrderStatus, onEditOrder, onPrintKOT }) => {
  const [stationFilter, setStationFilter] = useState<KitchenStation | 'ALL'>('ALL');

  const activeOrders = orders.filter(
    o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED && o.status !== OrderStatus.HELD
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.READY: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: OrderType) => {
      switch (type) {
          case OrderType.DELIVERY: return <Bike size={16} />;
          case OrderType.TAKEAWAY: return <ShoppingBag size={16} />;
          default: return <Utensils size={16} />;
      }
  }

  // Filter items logic: An order is shown if it contains ANY item for the selected station.
  // Visual improvement: Highlight items belonging to selected station? Or just show full order?
  // Standard KDS: Show full order, but maybe dim unrelated items. For simplicity, we show full order if it has relevant items.
  const filteredOrders = stationFilter === 'ALL' 
    ? activeOrders 
    : activeOrders.filter(o => o.items.some(i => i.station === stationFilter || (!i.station && stationFilter === KitchenStation.MAIN_KITCHEN)));

  return (
    <div className="p-6 h-full overflow-y-auto bg-surface">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Kitchen Display
            <span className="px-3 py-1 rounded-full bg-primary text-white text-sm">
              {filteredOrders.length}
            </span>
          </h1>
          <span className="font-urdu text-lg text-gray-500">باورچی خانہ سکرین</span>
        </div>
        
        {/* Station Filter */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
            <Filter size={18} className="text-gray-400"/>
            <select 
                className="bg-transparent font-bold text-gray-700 outline-none"
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value as KitchenStation | 'ALL')}
            >
                <option value="ALL">All Stations</option>
                {Object.values(KitchenStation).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
            <CheckCircle size={64} className="mb-4 opacity-20" />
            <p className="text-lg">No active orders for this station</p>
            <p className="font-urdu text-xl mt-2">کوئی آرڈر نہیں ہے</p>
          </div>
        )}
        
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative group h-full animate-fade-in">
             
             {/* Action Overlay: Edit & Print */}
             <div className="absolute top-2 right-2 z-10 flex gap-2">
                 <button 
                    onClick={() => onPrintKOT(order)}
                    className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-black border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Print KOT"
                 >
                    <Printer size={18} />
                 </button>
                 {order.status === OrderStatus.PENDING && (
                    <button 
                        onClick={() => onEditOrder(order)}
                        className="bg-white p-2 rounded-full shadow-md text-blue-600 hover:text-blue-800 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Order"
                    >
                        <Edit3 size={18} />
                    </button>
                 )}
             </div>

            <div className={`p-4 border-b ${
              order.status === OrderStatus.PENDING ? 'bg-yellow-50/50' : 
              order.status === OrderStatus.PREPARING ? 'bg-blue-50/50' : 'bg-green-50/50'
            }`}>
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2 text-gray-700 font-bold">
                    {getTypeIcon(order.type)}
                    <span>
                        {order.type === OrderType.DINE_IN ? `Table ${order.tableNumber}` : order.type}
                    </span>
                 </div>
                 <span className="font-mono text-xl font-bold">#{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                    </span>
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 space-y-4">
              {order.items.map((item, idx) => {
                  // Dim items not relevant to current filter
                  const isRelevant = stationFilter === 'ALL' || item.station === stationFilter || (!item.station && stationFilter === KitchenStation.MAIN_KITCHEN);
                  
                  return (
                    <div key={`${order.id}-${idx}`} className={`flex flex-col border-b border-dashed border-gray-100 pb-3 last:border-0 ${!isRelevant ? 'opacity-30' : ''}`}>
                    <div className="flex gap-3 w-full items-start">
                        <span className="font-bold text-primary text-2xl w-8 text-center bg-red-50 rounded h-10 flex items-center justify-center mt-1">{item.quantity}</span>
                        <div className="flex-1 flex flex-col">
                            {/* Large Urdu Text for Kitchen visibility */}
                            {item.urduName && (
                                <span className="font-urdu text-3xl font-bold text-gray-800 text-right leading-loose -mt-1 mb-1">
                                    {item.urduName}
                                </span>
                            )}
                            <span className="text-gray-600 font-medium text-sm">{item.name} {item.selectedVariation && `(${item.selectedVariation.name})`}</span>
                            
                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedAddons.map((addon, aIdx) => (
                                        <span key={aIdx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                                            + {addon.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {item.notes && <p className="text-sm text-red-600 font-bold italic mt-1 bg-red-50 p-1 rounded">Note: {item.notes}</p>}
                        </div>
                    </div>
                    </div>
                );
              })}
              
              {/* Order Level Note */}
              {order.kitchenNote && (
                  <div className="mt-3 bg-red-100 p-3 rounded text-sm text-red-900 border border-red-200 font-bold">
                      ⚠️ Note: {order.kitchenNote}
                  </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                {order.status === OrderStatus.PENDING && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, OrderStatus.PREPARING)}
                    className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    <span>Start Preparation</span>
                    <span className="font-urdu font-normal opacity-80">تیاری شروع کریں</span>
                  </button>
                )}
                {order.status === OrderStatus.PREPARING && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, OrderStatus.READY)}
                    className="col-span-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    <span>Mark Ready</span>
                    <span className="font-urdu font-normal opacity-80">تیار ہے</span>
                  </button>
                )}
                {order.status === OrderStatus.READY && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, OrderStatus.COMPLETED)}
                    className="col-span-2 py-3 bg-secondary hover:bg-slate-700 text-white rounded-lg font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    <span>Serve Order</span>
                    <span className="font-urdu font-normal opacity-80">پیش کریں</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenView;

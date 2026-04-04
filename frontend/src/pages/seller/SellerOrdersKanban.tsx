import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, Ban, CheckCircle2, Package, Truck, CheckCheck } from 'lucide-react';
import type { AdminOrder } from '../../types';
import { formatCOP } from '../../utils/formatCurrency';

interface SellerOrdersKanbanProps {
  orders: AdminOrder[];
  onStatusChange: (orderId: string, newStatus: number) => Promise<boolean>;
}

const KANBAN_COLUMNS = [
  { id: '1', title: 'Pendiente', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { id: '6', title: 'Cancelado', icon: Ban, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { id: '2', title: 'Pagado', icon: CheckCircle2, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  { id: '3', title: 'En Preparación', icon: Package, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { id: '4', title: 'Enviado', icon: Truck, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { id: '5', title: 'Entregado', icon: CheckCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
];

const SellerOrdersKanban: React.FC<SellerOrdersKanbanProps> = ({ orders: initialOrders, onStatusChange }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a column
    if (!destination) return;

    // Dropped in the same column
    if (destination.droppableId === source.droppableId) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const orderId = draggableId;

    // Hard block dragging from Pending(1), Delivered(5), or Cancelled(6)
    // to prevent edge cases if dragged via keyboard or glitches
    if (sourceStatus === '1' || sourceStatus === '5' || sourceStatus === '6') {
      return;
    }

    // OPTIMISTIC UI: Update local state immediately
    const prevOrders = [...orders];
    setOrders(prevOrders.map(o => o.id === orderId ? { ...o, status: destStatus } : o));

    // Call API
    const success = await onStatusChange(orderId, parseInt(destStatus));

    // Revert if failed
    if (!success) {
      setOrders(prevOrders);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-140px)] items-start custom-scrollbar">
        {KANBAN_COLUMNS.map((column) => {
          const columnOrders = orders.filter((o) => o.status === column.id);

          return (
            <div key={column.id} className="flex flex-col h-full bg-[#111] border border-white/5 rounded-2xl overflow-hidden min-w-[300px] w-[320px]">
              {/* Column Header */}
              <div className={`p-4 border-b flex items-center justify-between ${column.color}`}>
                <div className="flex items-center gap-2">
                  <column.icon className="w-5 h-5" />
                  <h3 className="font-bold tracking-widest uppercase text-sm">{column.title}</h3>
                </div>
                <span className="bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {columnOrders.length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    {columnOrders.map((order, index) => {
                      const isUnmovable = order.status === '1' || order.status === '5' || order.status === '6';
                      
                      return (
                      <Draggable key={order.id} draggableId={order.id} index={index} isDragDisabled={isUnmovable}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={`bg-[#1a1a1a] border rounded-xl p-4 transition-all duration-200 ${
                              isUnmovable ? 'opacity-75 cursor-not-allowed border-white/5' : 'cursor-grab active:cursor-grabbing'
                            } ${
                              snapshot.isDragging 
                                ? 'border-cyan-400/50 shadow-2xl shadow-cyan-400/20 scale-105 z-50' 
                                : isUnmovable ? '' : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-[10px] text-white/40 tracking-widest uppercase block mb-1">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                <p className="text-sm font-medium text-white">#{order.id.substring(0, 8)}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-bold text-sm block">
                                  {formatCOP(order.totalAmount)}
                                </span>
                                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                                  <Package className="w-3 h-3"/> {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-xs text-white/90 font-medium truncate">{order.customerName}</p>
                              <p className="text-[10px] text-white/40 truncate">{order.customerEmail}</p>
                            </div>

                            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/[0.02]">
                              {order.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex justify-between text-xs items-center gap-2">
                                  <span className="text-white/70 truncate flex-1 leading-tight">
                                    {item.productName}
                                  </span>
                                  <span className="text-cyan-400 font-medium whitespace-nowrap bg-cyan-400/10 px-1.5 rounded">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-center pt-1 mt-1 border-t border-white/[0.05]">
                                  <span className="text-[10px] text-white/30 italic">+{order.items.length - 2} productos más</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )})}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default SellerOrdersKanban;

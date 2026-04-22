import React, { useState, useEffect } from 'react';
import {
  Search, Package, Truck, CheckCircle, Clock,
  XCircle, Download, Eye, Calendar, CreditCard, Loader, Trash2
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Swal from 'sweetalert2';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = { status: selectedStatus, dateRange, limit: 50 };
      if (searchQuery) params.search = searchQuery;
      const { data } = await adminAPI.getOrders(params);
      setOrders(data.orders || []);

      // Compute local stats
      const allOrders = data.orders || [];
      setStats({
        total: data.total || 0,
        pending: allOrders.filter((o) => o.status === 'pending').length,
        completed: allOrders.filter((o) => o.status === 'completed').length,
        revenue: allOrders.filter((o) => ['completed', 'shipped'].includes(o.status)).reduce((s, o) => s + o.total, 0),
      });
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedStatus, dateRange]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    const labels = {
      pending: 'قيد الانتظار',
      processing: 'قيد التنفيذ',
      shipped: 'تم الشحن',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    const icons = { pending: Clock, processing: Package, shipped: Truck, completed: CheckCircle, cancelled: XCircle };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
        <Icon className="w-3.5 h-3.5" />
        {labels[status] || status}
      </span>
    );
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      Swal.fire({ title: 'تم التحديث!', text: 'تم تحديث حالة الطلب.', icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
    } catch {
      Swal.fire({ title: 'خطأ', text: 'فشل في تحديث الحالة.', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.deleteOrder(orderId);
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        // You might want to optionally refresh stats here.
        Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف الطلب بنجاح.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } catch (error) {
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء محاولة حذف الطلب.',
          icon: 'error',
          confirmButtonColor: '#4338ca',
          confirmButtonText: 'موافق'
        });
      }
    }
  };

  const statsCards = [
    { label: 'إجمالي الطلبات', value: stats.total, icon: Package, color: 'bg-[#4338ca]/10 text-[#4338ca]' },
    { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'طلبات مكتملة', value: stats.completed, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي الإيرادات', value: `${stats.revenue.toLocaleString()} ج.م`, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-6 font-['Cairo']" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة الطلبات</h2>
          <p className="text-slate-500 mt-1">تتبع وإدارة جميع طلبات العملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-3">{stat.value}</p>
              <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في الطلبات (رقم الطلب، اسم العميل)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] text-slate-700"
            />
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none">
              <option value="all">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد التنفيذ</option>
              <option value="shipped">تم الشحن</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none">
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
              <option value="90d">آخر 90 يوم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-[#4338ca] animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden text-right">
          <div className="overflow-x-auto text-right">
            <table className="w-full text-right">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {[
                    { id: 'expand', label: '' },
                    { id: 'order', label: 'رقم الطلب' },
                    { id: 'customer', label: 'العميل' },
                    { id: 'items', label: 'المنتجات' },
                    { id: 'total', label: 'الإجمالي' },
                    { id: 'status', label: 'الحالة' },
                    { id: 'date', label: 'التاريخ' },
                    { id: 'payment', label: 'الدفع' },
                    { id: 'actions', label: 'تغيير الحالة' }
                  ].map((h) => (
                    <th key={h.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-['Inter']">
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedOrderId === order._id ? 'bg-slate-50/50' : ''}`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    >
                      <td className="px-6 py-4">
                        <Eye className={`w-4 h-4 text-slate-400 transition-transform ${expandedOrderId === order._id ? 'rotate-180 text-[#4338ca]' : ''}`} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">#{order._id.toString().slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-['Cairo']">
                          <p className="font-bold text-slate-800">
                            {order.shippingAddress?.street
                              ? order.shippingAddress.street.replace('الاسم: ', '')
                              : (order.user?.name || 'عميل مجهول')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-['Cairo']">{(order.items?.length || 0)} منتجات</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="font-bold text-slate-800 ">{order.total?.toLocaleString()} ج.م</span>
                      </td>
                      <td className="px-6 py-4 font-['Cairo']">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 ml-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-['Cairo'] ${order.paymentMethod === 'card' ? 'bg-[#4338ca]/10 text-[#4338ca]' : 'bg-emerald-50 text-emerald-600'}`}>
                          <CreditCard className="w-3.5 h-3.5 ml-1" />
                          {order.paymentMethod === 'card' ? 'بطاقة بنكية' : 'دفع عند الاستلام'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-['Cairo']" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 font-bold focus:outline-none bg-white"
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="processing">قيد التنفيذ</option>
                            <option value="shipped">تم الشحن</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {expandedOrderId === order._id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="9" className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Products List */}
                            <div>
                              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#4338ca]" />
                                تفاصيل المنتجات
                              </h4>
                              <div className="space-y-4">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-6 h-6 text-slate-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-slate-800 truncate text-right">{item.name}</p>
                                      <p className="text-sm text-slate-500 text-right">
                                        {item.quantity} × {item.price?.toLocaleString()} ج.م
                                      </p>
                                    </div>
                                    <div className="text-left font-bold text-[#4338ca]">
                                      {(item.quantity * item.price)?.toLocaleString()} ج.م
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Customer Data */}
                            <div>
                              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-[#4338ca]" />
                                بيانات العميل
                              </h4>
                              <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center pb-2">
                                  <span className="text-slate-500">اسم العميل</span>
                                  <span className="font-bold text-xl text-slate-800">
                                    {order.shippingAddress?.street
                                      ? order.shippingAddress.street.replace('الاسم: ', '')
                                      : (order.user?.name || 'غير متوفر')}
                                  </span>
                                </div>
                                <div className="pt-2 flex justify-between items-center font-bold text-lg text-slate-900 border-t border-slate-50">
                                  <span>الإجمالي</span>
                                  <span>{order.total?.toLocaleString()} ج.م</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-16 text-slate-500 font-['Cairo']">لا توجد طلبات حالياً.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

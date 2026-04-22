import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Package, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data: res } = await adminAPI.getDashboard(timeRange);
        setData(res);
      } catch {
        // use null — will show N/A
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [timeRange]);

  const stats = data
    ? [
      {
        title: 'إجمالي الإيرادات',
        value: `${(data.stats.totalRevenue || 0).toLocaleString()} ج.م`,
        change: `${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}%`,
        trend: data.stats.revenueChange >= 0 ? 'up' : 'down',
        icon: DollarSign,
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        title: 'إجمالي الطلبات',
        value: data.stats.totalOrders?.toString() || '0',
        change: `${data.stats.ordersChange >= 0 ? '+' : ''}${data.stats.ordersChange}%`,
        trend: data.stats.ordersChange >= 0 ? 'up' : 'down',
        icon: ShoppingBag,
        color: 'bg-[#4338ca]/10 text-[#4338ca]',
      },
      {
        title: 'مستخدمون جدد',
        value: data.stats.totalUsers?.toString() || '0',
        change: 'هذه الفترة',
        trend: 'up',
        icon: Users,
        color: 'bg-blue-50 text-blue-600',
      },
      {
        title: 'منتجات نشطة',
        value: data.stats.totalProducts?.toString() || '0',
        change: 'في المتجر',
        trend: 'up',
        icon: Package,
        color: 'bg-rose-50 text-rose-600',
      },
    ]
    : [];

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'قيد التنفيذ';
      case 'shipped': return 'تم الشحن';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const COLORS = ['#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">نظرة عامة على لوحة التحكم</h2>
          <p className="text-slate-500 mt-1">تتبع أداء عملك ومقاييس الأداء الرئيسية</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
          {[
            { id: '24h', label: '24 ساعة' },
            { id: '7d', label: '7 أيام' },
            { id: '30d', label: '30 يوم' },
            { id: '90d', label: '90 يوم' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range.id ? 'bg-[#4338ca] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader className="w-8 h-8 text-[#4338ca] animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stat.change}
                      <TrendIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">إحصائيات الإيرادات</h3>
                  <p className="text-sm text-slate-500">الإيرادات اليومية للفترة المختارة</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueByDay || []} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4338ca" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'right' }}
                      formatter={(v) => [`${v} ج.م`, 'الإيرادات']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4338ca" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Category Stats */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft font-['Cairo']">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">المبيعات حسب التصنيف</h3>
                  <p className="text-sm text-slate-500">التصنيفات الأكثر مبيعاً</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.categoryStats || []} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={80} orientation="right" />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'right' }}
                        formatter={(v) => [v, 'وحدة']}
                      />
                      <Bar dataKey="value" radius={[8, 0, 0, 8]} barSize={24}>
                        {(data?.categoryStats || []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert - Only show if there are alerts */}
            {(data?.lowStockProducts || []).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 font-['Cairo']">تنبيهات المخزون</h3>
                    <p className="text-sm text-slate-500 font-['Cairo']">منتجات تحتاج إلى إعادة تزويد</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.lowStockProducts.map((p) => (
                    <div key={p._id} className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 font-['Inter']">{p.stock} قطعة متبقية <span className="font-['Cairo']">(الحد الأدنى: {p.minStock || 5})</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">أحدث الطلبات</h3>
                  <p className="text-sm text-slate-500">آخر طلبات تم إجراؤها من العملاء</p>
                </div>
              </div>
              <div className="space-y-3">
                {(data?.recentOrders || []).map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">طلبية #{order._id.toString().slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{order.user?.name || 'عميل مجهول'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-800">{order.total?.toLocaleString()} ج.م</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {!data?.recentOrders?.length && (
                  <p className="text-sm text-slate-500">لا توجد طلبات حتى الآن.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

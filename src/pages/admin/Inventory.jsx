import React, { useState, useEffect } from 'react';
import {
  Search, Package, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownLeft,
  Warehouse, Edit2, History, Plus, Download, Grid3X3,
  List, BarChart3, Truck, Boxes, Loader, Save, TrendingUp, Filter, RefreshCw,
  Printer, ArrowRightLeft, FileSpreadsheet, MoreHorizontal
} from 'lucide-react';
import { inventoryAPI, productAPI } from '../../services/api';
import Swal from 'sweetalert2';

const Inventory = () => {
  const [view, setView] = useState('overview'); // 'overview' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0, categoryStats: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const categories = ['قطعة', 'دش', 'ريسيفر', 'ريموت', 'صواميل', 'سلك', 'حامل شاشة', 'حامل قطعة', 'حجار', 'عدسة', 'وصلة 2×1', 'وصلة 3×1', 'وصلة 3×3', 'أدبتور', 'وصلة HD', 'دايزك', 'أخرى'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, prodRes] = await Promise.all([
        inventoryAPI.getStats(),
        productAPI.getAll({
          limit: 200,
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        })
      ]);
      setStats(statsRes.data.stats);

      let filteredProducts = prodRes.data.products;
      if (selectedStatus === 'low') {
        filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
      } else if (selectedStatus === 'out') {
        filteredProducts = filteredProducts.filter(p => p.stock === 0);
      }

      setInventory(filteredProducts);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data } = await inventoryAPI.getLogs({ limit: 100 });
      setLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'overview') {
      const t = setTimeout(fetchData, 300);
      return () => clearTimeout(t);
    } else {
      fetchLogs();
    }
  }, [view, searchQuery, selectedCategory, selectedStatus]);

  const handleAdjustStock = async (item, type) => {
    const title = type === 'in' ? 'إضافة مخزون' : type === 'out' ? 'صرف مخزون' : 'تعديل مخزون جرد';
    const confirmButtonText = type === 'in' ? 'إضافة' : type === 'out' ? 'صرف' : 'تعديل';

    const { value: formValues } = await Swal.fire({
      title: `<div class="text-2xl font-bold mb-2 font-['Cairo']">${title}</div><div class="text-sm font-normal text-slate-500 font-['Cairo']">${item.name}</div>`,
      html:
        `<div class="space-y-4 pt-4 text-right font-['Cairo']" dir="rtl">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">الكمية</label>
                        <input id="swal-input1" type="number" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="0">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">السبب</label>
                        <select id="swal-input2" class="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none bg-slate-50">
                            <option value="restock">توريد جديد (Restock)</option>
                            <option value="sale">بيع (Sale)</option>
                            <option value="return">مرتجع (Return)</option>
                            <option value="damage">تالف (Damage)</option>
                            <option value="correction">تصحيح جرد (Correction)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                        <textarea id="swal-input3" class="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" rows="2" placeholder="اكتب أي ملاحظات هنا..."></textarea>
                    </div>
                </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#4338ca',
      preConfirm: () => {
        const quantity = document.getElementById('swal-input1').value;
        if (!quantity || quantity <= 0) {
          Swal.showValidationMessage('يرجى إدخال كمية صحيحة');
          return false;
        }
        return {
          quantity: quantity,
          reason: document.getElementById('swal-input2').value,
          note: document.getElementById('swal-input3').value
        };
      }
    });

    if (formValues) {
      setIsAdjusting(true);
      try {
        await inventoryAPI.adjust({
          productId: item._id,
          type,
          quantity: formValues.quantity,
          reason: formValues.reason,
          note: formValues.note
        });
        fetchData();
        Swal.fire({
          title: 'تم التحديث بنجاح',
          text: `تم تحديث مخزون ${item.name} بنجاح.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } catch (error) {
        Swal.fire({ title: 'خطأ', text: error.response?.data?.message || 'فشل تحديث المخزون', icon: 'error' });
      } finally {
        setIsAdjusting(false);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Product', 'SKU', 'Category', 'Stock', 'Min Stock', 'Price'];
    const data = inventory.map(item => [
      item.name,
      item.sku || 'N/A',
      item.category,
      item.stock,
      item.minStock || 5,
      item.price
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(",") + "\n"
      + data.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return { color: 'bg-rose-50 text-rose-700 border-rose-100', label: 'نفذ المخزون', icon: AlertTriangle };
    if (item.stock <= (item.minStock || 5)) return { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'مخزون منخفض', icon: TrendingUp };
    return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'متوفر', icon: CheckCircle };
  };

  return (
    <div className="space-y-6 font-['Cairo'] pb-10" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-[#4338ca]" />
            إدارة المخزون والمستودعات
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">نظام مراقبة المخزون الاحترافي لمجموعة البسيوني</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setView('overview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'overview' ? 'bg-white text-[#4338ca] shadow-soft' : 'text-slate-500 hover:bg-white/50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
              الجرد الحالي
            </button>
            <button
              onClick={() => setView('logs')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'logs' ? 'bg-white text-[#4338ca] shadow-soft' : 'text-slate-500 hover:bg-white/50'}`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              حركة المخزون
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-soft shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير Excel
          </button>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'إجمالي الأصناف', value: stats.totalProducts, sub: 'صنف مسجل', icon: Package, color: 'bg-indigo-50 text-indigo-600' },
              { label: 'أصناف منخفضة', value: stats.lowStock, sub: 'تحتاج لإعادة توريد', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
              { label: 'نفذت من المخزون', value: stats.outOfStock, sub: 'رصيد صفري', icon: AlertTriangle, color: 'bg-rose-50 text-rose-600' },
              { label: 'قيمة المستودع', value: `${(stats.totalValue || 0).toLocaleString()} ج.م`, sub: 'إجمالي التكلفة الحالية', icon: BarChart3, color: 'bg-emerald-50 text-emerald-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:translate-y-[-4px] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-lg">Performance</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800 my-1">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Category Distribution Quick View */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">توزيع المخزون حسب التصنيف</h3>
              <RefreshCw className="w-5 h-5 text-slate-400 cursor-pointer hover:rotate-180 transition-all duration-500" onClick={fetchData} />
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
              {stats.categoryStats?.length > 0 ? (
                stats.categoryStats.map((c, i) => (
                  <div key={i} className="shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-4 min-w-[160px] hover:bg-white hover:border-[#4338ca]/20 transition-all cursor-default">
                    <p className="text-xs font-bold text-slate-400 mb-1">{c._id || 'أخرى'}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-black text-slate-800">{c.stock}</span>
                      <span className="text-[10px] font-bold text-indigo-600">{c.count} صنف</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#4338ca] h-full" style={{ width: `${Math.min(100, (c.stock / 1000) * 100)}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">لا توجد بيانات متاحة للتصنيفات</p>
              )}
            </div>
          </div>

          {/* Advanced Controls & Filtering */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft flex flex-col xl:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full text-right">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4338ca]" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو SKU أو الباركود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4338ca]/30 outline-none text-slate-700 font-bold transition-all text-right h-12"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 h-12">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
                >
                  <option value="all">كل التصنيفات</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>


              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); fetchData(); }}
                className="px-6 h-12 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all font-bold text-sm"
              >
                تصفير الفلاتر
              </button>
            </div>
          </div>

          {/* Inventory Table Container */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-sm font-black text-slate-600 uppercase tracking-wide">المنتج والمواصفات</th>
                    <th className="px-6 py-5 text-sm font-black text-slate-600 uppercase tracking-wide text-center">التصنيف</th>
                    <th className="px-6 py-5 text-sm font-black text-slate-600 uppercase tracking-wide text-center">الرصيد</th>
                    <th className="px-6 py-5 text-sm font-black text-slate-600 uppercase tracking-wide text-center">الحالة</th>
                    <th className="px-6 py-5 text-sm font-black text-slate-600 uppercase tracking-wide text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="5" className="py-32 text-center text-slate-400"><Loader className="w-12 h-12 text-[#4338ca] animate-spin mx-auto mb-4" /><p className="font-bold animate-pulse">جاري جرد المنتجات في المستودع...</p></td></tr>
                  ) : inventory.length === 0 ? (
                    <tr><td colSpan="5" className="py-24 text-center"><div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📦</div><p className="text-slate-500 font-bold text-xl">لا توجد سجلات مطابقة</p></td></tr>
                  ) : inventory.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shrink-0 flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                              {item.images?.[0]?.url ? <img src={item.images[0].url} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-300" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 text-lg leading-tight mb-1 truncate">{item.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase">SKU: {item.sku || 'N/A'}</span>
                                {item.barcode && <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">BC: {item.barcode}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-4 py-1.5 bg-indigo-50 text-[#4338ca] rounded-xl text-xs font-black shadow-sm ring-1 ring-indigo-500/10">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={`text-2xl font-black ${item.stock === 0 ? 'text-rose-600' : item.stock <= (item.minStock || 5) ? 'text-amber-600' : 'text-slate-800'}`}>
                            {item.stock}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 block -mt-1">قطعة</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border ${status.color}`}>
                            <status.icon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleAdjustStock(item, 'in')}
                              className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="إضافة كمية للمخزون"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item, 'out')}
                              className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              title="صرف كمية من المخزون"
                            >
                              <ArrowDownLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item, 'adjustment')}
                              className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              title="تعديل جرد يدوي"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Enhanced History Logs View */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800">سجل تحركات المخزون</h3>
                <p className="text-slate-500 font-medium italic">سجل زمني مفصل لجميع العمليات التي تمت على رصيد المستودع</p>
              </div>
              <div className="p-4 bg-indigo-50 text-[#4338ca] rounded-2xl shadow-inner">
                <History className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden shadow-inner overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead>
                  <tr className="bg-white/70 border-b border-slate-200">
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">التاريخ والوقت</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">المنتج</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase text-center">النوع</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase text-center">الكمية</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase text-center">الجرد (قبل/بعد)</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">السبب</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="7" className="py-24 text-center"><Loader className="w-8 h-8 text-[#4338ca] animate-spin mx-auto" /></td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan="7" className="py-12 text-center text-slate-500 text-lg font-bold italic">لا توجد حركات مسجلة حالياً</td></tr>
                  ) : logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">{new Date(log.createdAt).toLocaleDateString('ar-EG')}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.createdAt).toLocaleTimeString('ar-EG')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-800 text-sm">{log.product?.name || 'منتج محذوف'}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">SKU: {log.product?.sku || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black shadow-sm ring-1 ring-inset ${log.type === 'in' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20' :
                          log.type === 'out' ? 'bg-rose-50 text-rose-700 ring-rose-500/20' :
                            'bg-indigo-50 text-indigo-700 ring-indigo-500/20'
                          }`}>
                          {log.type === 'in' ? 'توريد +' : log.type === 'out' ? 'صرف -' : 'تعديل جرد'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-center font-black text-xl ${log.type === 'in' ? 'text-emerald-600' : log.type === 'out' ? 'text-rose-600' : 'text-indigo-600'}`}>
                        {log.type === 'in' ? '+' : log.type === 'out' ? '-' : ''}{log.quantity}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{log.previousStock}</span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                          <span className="text-sm font-black text-[#4338ca]">{log.newStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-[120px]">
                          <span className="text-xs font-black text-slate-700">
                            {log.reason === 'restock' ? 'توريد جديد' :
                              log.reason === 'sale' ? 'عملية بيع' :
                                log.reason === 'return' ? 'مرتجع عميل' :
                                  log.reason === 'damage' ? 'تالف / كسر' : 'تصحيح جرد يدوي'}
                          </span>
                          {log.note && <span className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[150px]">{log.note}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200 group-hover:bg-[#4338ca] group-hover:text-white transition-colors">
                            {log.user?.name ? log.user.name.charAt(0) : '?'}
                          </div>
                          <span className="text-xs font-black text-slate-600 group-hover:text-[#4338ca]">{log.user?.name || 'نظام'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Calendar,
  ShoppingBag, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
  Download, Plus, Shield, User, Loader
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminAPI.getUsers({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedStatus, selectedRole, currentPage]);

  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'حذف المستخدم؟',
      text: `هل أنت متأكد من حذف ${userName}؟ لا يمكن التراجع عن هذا الإجراء.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        Swal.fire({ title: 'تم الحذف!', icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
      } catch {
        Swal.fire({ title: 'خطأ', text: 'فشل في حذف المستخدم.', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      }
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedUsers.length === 0) return;
    try {
      await adminAPI.bulkUpdateUsers(selectedUsers, status);
      setUsers((prev) => prev.map((u) => selectedUsers.includes(u._id) ? { ...u, status } : u));
      setSelectedUsers([]);
      Swal.fire({ title: 'تم التحديث!', text: `تم تحديث حالة ${selectedUsers.length} مستخدم.`, icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
    } catch {
      Swal.fire({ title: 'خطأ', text: 'فشل الإجراء الجماعي.', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = { active: 'bg-emerald-50 text-emerald-700 border-emerald-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', inactive: 'bg-rose-50 text-rose-700 border-rose-200' };
    const labels = { active: 'نشط', pending: 'معلق', inactive: 'غير نشط' };
    const icons = { active: CheckCircle, pending: Clock, inactive: XCircle };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
        <Icon className="w-3.5 h-3.5" />
        {labels[status] || status}
      </span>
    );
  };

  const getAvatarColor = (name = '') => {
    const colors = ['bg-[#4338ca]', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
    return colors[name.length % colors.length];
  };

  const getInitials = (name = '') => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 font-['Cairo']" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">دليل المستخدمين</h2>
          <p className="text-slate-500 mt-1">إدارة العملاء والمشرفين في المتجر</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{total} مستخدم إجمالي</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم، البريد الإلكتروني، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] text-slate-700"
            />
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none">
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="pending">معلق</option>
              <option value="inactive">غير نشط</option>
            </select>
            <select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none">
              <option value="all">كل الرتب</option>
              <option value="customer">عميل</option>
              <option value="admin">مشرف</option>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={() => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u._id))}
                      className="w-4 h-4 rounded border-slate-300 text-[#4338ca]"
                    />
                  </th>
                  {[
                    { id: 'user', label: 'المستخدم' },
                    { id: 'contact', label: 'الاتصال' },
                    { id: 'role', label: 'الرتبة' },
                    { id: 'status', label: 'الحالة' },
                    { id: 'orders', label: 'الطلبات' },
                    { id: 'joined', label: 'الانضمام' },
                    { id: 'actions', label: 'الإجراءات' }
                  ].map((h) => (
                    <th key={h.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => setSelectedUsers((prev) => prev.includes(user._id) ? prev.filter((id) => id !== user._id) : [...prev, user._id])}
                        className="w-4 h-4 rounded border-slate-300 text-[#4338ca]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${getAvatarColor(user.name)} rounded-xl flex items-center justify-center text-white font-bold text-sm font-['Inter'] shadow-sm`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 ml-1" />
                            {user.location || 'غير محدد'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 font-['Inter']">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 ml-1" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 ml-1" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-[#4338ca]/10 text-[#4338ca]' : 'bg-slate-100 text-slate-700'}`}>
                        {user.role === 'admin' ? <Shield className="w-3.5 h-3.5 ml-1" /> : <User className="w-3.5 h-3.5 ml-1" />}
                        {user.role === 'admin' ? 'مشرف' : 'عميل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 font-['Inter']">
                        <ShoppingBag className="w-4 h-4 text-slate-400 ml-1" />
                        {user.totalOrders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5 font-['Inter']">
                        <Calendar className="w-3.5 h-3.5 ml-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(user._id, user.name)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors text-slate-400">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-16 text-slate-500">لا يوجد مستخدمون مطابقون للبحث.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-['Inter']">
            <p className="text-sm text-slate-500 font-['Cairo']">
              عرض <span className="font-bold text-slate-700">{users.length}</span> من أصل{' '}
              <span className="font-bold text-slate-700">{total}</span> مستخدم
            </p>
            <div className="flex items-center gap-2" dir="ltr">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-[#4338ca] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-soft-lg flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-bold">{selectedUsers.length} مستخدم مختار</span>
          <div className="h-4 w-px bg-slate-600" />
          <button onClick={() => handleBulkAction('active')} className="text-sm font-bold hover:text-emerald-400 transition-colors">تنشيط</button>
          <button onClick={() => handleBulkAction('inactive')} className="text-sm font-bold hover:text-amber-400 transition-colors">إلغاء التنشيط</button>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;

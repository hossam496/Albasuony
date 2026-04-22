import React, { useState, useEffect } from 'react';
import {
    Tag, Plus, Edit2, Trash2, Search, Save, X, Loader,
    BarChart3, Package, CheckCircle, AlertCircle
} from 'lucide-react';
import { brandAPI } from '../../services/api';
import Swal from 'sweetalert2';

const BrandManagement = () => {
    const [brands, setBrands] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandData, setBrandData] = useState({ name: '', description: '' });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [brandsRes, statsRes] = await Promise.all([
                brandAPI.get(),
                brandAPI.getStats()
            ]);
            setBrands(brandsRes.data.brands);
            setStats(statsRes.data.stats);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setBrandData({ name: brand.name, description: brand.description || '' });
        } else {
            setEditingBrand(null);
            setBrandData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!brandData.name) return;

        setIsSaving(true);
        try {
            if (editingBrand) {
                await brandAPI.update(editingBrand._id, brandData);
                Swal.fire({ title: 'تم التحديث!', text: 'تم تحديث العلامة التجارية بنجاح.', icon: 'success', timer: 1500, showConfirmButton: false });
            } else {
                await brandAPI.create(brandData);
                Swal.fire({ title: 'تمت الإضافة!', text: 'تم إضافة العلامة التجارية بنجاح.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            Swal.fire('خطأ', error.response?.data?.message || 'فشل حفظ البيانات', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'لن تتمكن من استرجاع هذه الماركة!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف!',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                await brandAPI.delete(id);
                Swal.fire('تم الحذف!', 'تم حذف العلامة التجارية بنجاح.', 'success');
                fetchData();
            } catch (error) {
                Swal.fire('خطأ', error.response?.data?.message || 'فشل الحذف', 'error');
            }
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 font-['Cairo'] pb-10 text-right" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Tag className="w-8 h-8 text-[#4338ca]" />
                        إدارة العلامات التجارية
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium italic">إدارة وتنسيق ماركات المنتجات المتاحة في المتجر</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4338ca] text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-5 h-5" />
                    إضافة ماركة جديدة
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Tag className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-lg">Brands</span>
                    </div>
                    <p className="text-slate-500 text-sm font-bold">إجمالي الماركات</p>
                    <p className="text-2xl font-black text-slate-800 my-1">{brands.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-bold">إجمالي المنتجات</p>
                    <p className="text-2xl font-black text-slate-800 my-1">{stats?.totalProducts || 0}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-bold">أكثر ماركة طلباً</p>
                    <p className="text-xl font-black text-slate-800 my-1">{stats?.topBrand?._id || 'N/A'}</p>
                </div>
            </div>

            {/* Brands List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن ماركة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#4338ca]/20 outline-none transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-slate-50 text-[#475569] text-sm font-black border-b border-slate-100">
                                <th className="px-6 py-4">اسم العلامة التجارية</th>
                                <th className="px-6 py-4">الوصف</th>
                                <th className="px-6 py-4 text-center">المنتجات المرتبطة</th>
                                <th className="px-6 py-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center">
                                        <Loader className="w-8 h-8 text-[#4338ca] animate-spin mx-auto mb-2" />
                                        <p className="text-slate-400 font-bold">جاري تحميل البيانات...</p>
                                    </td>
                                </tr>
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500 font-bold">
                                        لا توجد علامات تجارية مطابقة للبحث
                                    </td>
                                </tr>
                            ) : filteredBrands.map((brand) => (
                                <tr key={brand._id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <span className="font-black text-slate-800 text-lg">{brand.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-500 font-medium">{brand.description || 'لا يوجد وصف'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 bg-indigo-50 text-[#4338ca] rounded-lg text-xs font-black ring-1 ring-indigo-500/10">
                                            {brand.productCount || 0} منتج
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(brand)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand._id)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Brand Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 left-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-800 mb-1">
                                {editingBrand ? 'تعديل علامة تجارية' : 'إضافة علامة تجارية'}
                            </h3>
                            <p className="text-slate-500 font-medium">أدخل تفاصيل العلامة التجارية أدناه</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-black text-slate-700 mr-2">اسم الماركة</label>
                                <div className="relative">
                                    <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={brandData.name}
                                        onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#4338ca] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-black text-lg"
                                        placeholder="مثال: Nova, GALAXY..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-black text-slate-700 mr-2">وصف مختصر</label>
                                <textarea
                                    value={brandData.description}
                                    onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#4338ca] outline-none transition-all font-medium h-32 resize-none"
                                    placeholder="وصف اختياري للعلامة التجارية..."
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#4338ca] text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    حفظ البيانات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandManagement;

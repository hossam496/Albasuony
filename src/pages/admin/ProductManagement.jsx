import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, X, Plus, ChevronDown, Save, Trash2, Eye,
  Package, DollarSign, Tag, Boxes, Edit2, Search, Loader
} from 'lucide-react';
import { productAPI } from '../../services/api';
import Swal from 'sweetalert2';

const CATEGORIES = ['قطعة', 'دش', 'ريسيفر', 'ريموت', 'صواميل', 'سلك', 'حامل شاشة', 'حامل قطعة', 'حجار', 'عدسة', 'وصلة 2×1', 'وصلة 3×1', 'وصلة 3×3', 'أدبتور', 'وصلة HD', 'دايزك', 'أخرى'];

const emptyProduct = {
  name: '', description: '', price: '', comparePrice: '', sku: '',
  barcode: '', category: '', stock: '', minStock: '',
  weight: '', dimensions: { length: '', width: '', height: '' },
  status: 'active', tags: [], seoTitle: '', seoDescription: '', taxRate: '14',
};

const InputField = ({ label, name, type = 'text', placeholder, value, onChange, icon: Icon, required, textarea, rows = 4 }) => (
  <div className="space-y-1.5 font-['Cairo']">
    <label className="block text-sm font-medium text-slate-700">{label}{required && <span className="text-rose-500 mr-1">*</span>}</label>
    <div className="relative">
      {Icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon className="w-5 h-5" /></div>}
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] transition-all resize-none text-slate-700 placeholder:text-slate-400 ${Icon ? 'pr-11' : ''}`} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] transition-all text-slate-700 placeholder:text-slate-400 ${Icon ? 'pr-11' : ''}`} />
      )}
    </div>
  </div>
);

const ProductManagement = () => {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [product, setProduct] = useState(emptyProduct);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setIsLoadingList(true);
    try {
      const { data } = await productAPI.getAll({ limit: 100, search: searchTerm || undefined });
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') fetchProducts();
  }, [view, searchTerm]);

  const openAdd = () => { setProduct(emptyProduct); setImages([]); setEditingProduct(null); setView('form'); setActiveTab('basic'); };
  const openEdit = (p) => {
    setProduct({ ...p, price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : '', stock: String(p.stock), minStock: String(p.minStock), taxRate: String(p.taxRate || 14), dimensions: p.dimensions || { length: '', width: '', height: '' } });
    setImages((p.images || []).map((img, i) => ({ id: i, preview: img.url, publicId: img.publicId, existing: true })));
    setEditingProduct(p);
    setView('form');
    setActiveTab('basic');
  };

  const handleFiles = (files) => {
    const newImages = Array.from(files).filter((f) => f.type.startsWith('image/')).map((file) => ({
      id: Date.now() + Math.random(), file, preview: URL.createObjectURL(file), name: file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.category) {
      Swal.fire({ title: 'خطأ', text: 'يرجى إدخال الاسم والسعر والتصنيف.', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      const fields = ['name', 'description', 'price', 'comparePrice', 'sku', 'barcode', 'category', 'stock', 'minStock', 'weight', 'status', 'seoTitle', 'seoDescription', 'taxRate'];
      fields.forEach((f) => { if (product[f] !== undefined && product[f] !== '') formData.append(f, product[f]); });
      formData.append('dimensions', JSON.stringify(product.dimensions));
      formData.append('tags', JSON.stringify(product.tags));
      images.filter((img) => img.file).forEach((img) => formData.append('images', img.file));

      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        Swal.fire({ title: 'تم التحديث!', text: 'تم تحديث المنتج بنجاح.', icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
      } else {
        await productAPI.create(formData);
        Swal.fire({ title: 'تم الإضافة!', text: 'تم إضافة المنتج بنجاح.', icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
      }
      setView('list');
    } catch (error) {
      const msg = error.response?.data?.message || 'فشل في حفظ المنتج.';
      Swal.fire({ title: 'خطأ', text: msg, icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'حذف المنتج؟',
      text: `هل أنت متأكد من حذف "${productName}"؟ لن يمكنك التراجع عن هذا الإجراء.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });
    if (result.isConfirmed) {
      try {
        await productAPI.delete(productId);
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        Swal.fire({ title: 'تم الحذف!', icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
      } catch {
        Swal.fire({ title: 'خطأ', text: 'فشل في حذف المنتج.', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      }
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case 'active': return 'نشط';
      case 'draft': return 'مسودة';
      case 'archived': return 'مؤرشف';
      default: return s;
    }
  };

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="space-y-6 font-['Cairo']" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">إدارة المنتجات</h2>
            <p className="text-slate-500 mt-1">عرض وتعديل وإضافة منتجات المتجر</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-6 py-2.5 bg-[#4338ca] text-white rounded-xl font-bold hover:bg-[#3730a3] transition-colors shadow-soft">
            <Plus className="w-4 h-4 ml-1" />
            إضافة منتج جديد
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="بحث عن منتج..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] text-slate-700" />
          </div>
        </div>

        {isLoadingList ? (
          <div className="flex items-center justify-center py-16"><Loader className="w-8 h-8 text-[#4338ca] animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    {['المنتج', 'التصنيف', 'السعر', 'المخزون', 'الحالة', 'الإجراءات'].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-['Inter']">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                            {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 font-['Cairo']">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.sku || 'بدون رمز SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-slate-600 font-['Cairo']">{p.category}</span></td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{p.price.toLocaleString()} ج.م</span>
                        {p.comparePrice && <span className="text-xs text-slate-400 line-through mr-1 font-['Inter']">{p.comparePrice}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${p.stock === 0 ? 'text-rose-600' : p.stock <= (p.minStock || 5) ? 'text-amber-600' : 'text-emerald-600'}`}>{p.stock} قطعة</span>
                      </td>
                      <td className="px-6 py-4 font-['Cairo']">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : p.status === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {getStatusLabel(p.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 hover:bg-[#4338ca]/10 hover:text-[#4338ca] rounded-lg transition-colors text-slate-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.name)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors text-slate-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-['Cairo']">
                  لا توجد منتجات مطابقة للبحث.
                  <button onClick={openAdd} className="text-[#4338ca] font-bold mr-1">أضف أول منتج لك.</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── FORM VIEW ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-['Cairo']" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
          <p className="text-slate-500 mt-1">{editingProduct ? `تعديل: ${editingProduct.name}` : 'إنشاء منتج جديد في متجرك'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">
            العودة للقائمة →
          </button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#4338ca] text-white rounded-xl font-bold hover:bg-[#3730a3] transition-colors shadow-soft disabled:opacity-60">
            {isSaving ? <Loader className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
            {editingProduct ? 'حفظ التغييرات' : 'نشر المنتج'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200 w-fit">
        {[
          { id: 'basic', label: 'المعلومات الأساسية' },
          { id: 'media', label: 'الصور' },
          { id: 'pricing', label: 'التسعير' },
          { id: 'inventory', label: 'المخزون' },
          { id: 'seo', label: 'تحسين محركات البحث' }
        ].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#4338ca] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{tab.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'basic' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-4">المعلومات الأساسية</h3>
              <InputField label="اسم المنتج" name="name" placeholder="مثال: ريسيفر بدقة 4K" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} icon={Package} required />
              <InputField label="وصف المنتج" name="description" textarea placeholder="أدخل وصفاً مفصلاً للمنتج..." value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={5} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">التصنيف <span className="text-rose-500 mr-1">*</span></label>
                  <div className="relative">
                    <select value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} className="w-full pr-11 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] appearance-none text-slate-700">
                      <option value="">اختر التصنيف</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">الوسوم (Tags)</label>
                <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                  {product.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-[#4338ca]/10 text-[#4338ca] rounded-lg text-sm font-bold">
                      {tag}
                      <button type="button" onClick={() => setProduct((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} className="hover:text-rose-500 mr-1"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newTag.trim() && !product.tags.includes(newTag.trim())) { setProduct((p) => ({ ...p, tags: [...p.tags, newTag.trim()] })); setNewTag(''); } } }} placeholder={product.tags.length === 0 ? 'أضف وسوماً...' : ''} className="flex-1 min-w-[100px] px-2 py-1 outline-none text-sm text-slate-700 font-['Cairo']" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-4">صور المنتج</h3>
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-[#4338ca] bg-[#4338ca]/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
                <div className="w-16 h-16 bg-white rounded-xl shadow-soft flex items-center justify-center mx-auto mb-4"><Upload className="w-8 h-8 text-[#4338ca]" /></div>
                <p className="text-slate-700 font-bold mb-1">اسحب الصور هنا، أو اضغط للتصفح</p>
                <p className="text-sm text-slate-500">يدعم: JPG, PNG, WebP (بحد أقصى 5 ميجا للصورة)</p>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <img src={image.preview} alt={image.name || 'Product'} className="w-full h-full object-cover" />
                      </div>
                      {index === 0 && <span className="absolute top-2 right-2 px-2 py-1 bg-[#4338ca] text-white text-xs font-bold rounded-lg shadow-sm">الرئيسية</span>}
                      <button type="button" onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))} className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6 font-['Cairo']">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-4">التسعير والترميز</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-['Inter']">
                <InputField label="سعر البيع" name="price" type="number" placeholder="0.00" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} icon={DollarSign} required />
                <InputField label="السعر قبل الخصم (اختياري)" name="comparePrice" type="number" placeholder="0.00" value={product.comparePrice} onChange={(e) => setProduct({ ...product, comparePrice: e.target.value })} icon={Tag} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-['Inter']">
                <InputField label="رمز SKU" name="sku" placeholder="مثال: REC-4K-001" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} />
                <InputField label="الباركود (Barcode)" name="barcode" placeholder="مثال: 1234567890" value={product.barcode} onChange={(e) => setProduct({ ...product, barcode: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-4">المخزون والشحن</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-['Inter']">
                <InputField label="كمية المخزون" name="stock" type="number" placeholder="0" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} icon={Boxes} />
                <InputField label="تنبيه نقص المخزون (الحد الأدنى)" name="minStock" type="number" placeholder="5" value={product.minStock} onChange={(e) => setProduct({ ...product, minStock: e.target.value })} />
              </div>
              <InputField label="الوزن (كيلوجرام)" name="weight" type="number" placeholder="0.00" value={product.weight} onChange={(e) => setProduct({ ...product, weight: e.target.value })} />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-4">تحسين محركات البحث (SEO)</h3>
              <InputField label="عنوان SEO" name="seoTitle" placeholder="عنوان جذاب يظهر في نتائج البحث..." value={product.seoTitle} onChange={(e) => setProduct({ ...product, seoTitle: e.target.value })} />
              <p className="text-xs text-slate-400 font-['Inter'] -mt-4">{product.seoTitle.length}/60 حرف</p>
              <InputField label="وصف SEO" name="seoDescription" textarea rows={3} placeholder="وصف موجز للمنتج يظهر في جوجل..." value={product.seoDescription} onChange={(e) => setProduct({ ...product, seoDescription: e.target.value })} />
              <p className="text-xs text-slate-400 font-['Inter'] -mt-4">{product.seoDescription.length}/160 حرف</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-50 pb-2">حالة المنتج</h3>
            <div className="space-y-3">
              {[
                { value: 'active', label: 'نشط', desc: 'يظهر للعملاء في المتجر' },
                { value: 'draft', label: 'مسودة', desc: 'مخفي من المتجر حالياً' },
                { value: 'archived', label: 'مؤرشف', desc: 'محفوظ في الأرشيف للرجوع إليه' }
              ].map((s) => (
                <label key={s.value} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${product.status === s.value ? 'bg-[#4338ca]/10 border border-[#4338ca]/20' : 'hover:bg-slate-50 border border-transparent'}`}>
                  <input type="radio" name="status" value={s.value} checked={product.status === s.value} onChange={(e) => setProduct({ ...product, status: e.target.value })} className="mt-1 w-4 h-4 text-[#4338ca]" />
                  <div>
                    <p className={`font-bold ${product.status === s.value ? 'text-[#4338ca]' : 'text-slate-700'}`}>{s.label}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
            <h3 className="text-lg font-bold text-slate-800 mb-4">معاينة المنتج</h3>
            <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-slate-100 shadow-sm">
              {images.length > 0 ? (
                <img src={images[0].preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Package className="w-12 h-12 text-slate-300" />
              )}
            </div>
            <p className="font-bold text-slate-800 truncate">{product.name || 'اسم المنتج'}</p>
            <p className="text-xl font-black text-[#4338ca] mt-1 font-['Inter']">{(Number(product.price) || 0).toLocaleString()} <span className="text-sm font-bold font-['Cairo']">ج.م</span></p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductManagement;

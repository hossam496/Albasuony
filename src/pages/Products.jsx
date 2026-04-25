import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Star, ChevronDown, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import Swal from 'sweetalert2';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['الكل']);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch categories and brands
  useEffect(() => {
    productAPI.getCategories()
      .then(({ data }) => setCategories(['الكل', ...data.categories]))
      .catch(() => setCategories(['الكل', 'قطعة', 'دش', 'ريسيفر', 'ريموت', 'صواميل', 'سلك', 'حامل شاشة', 'حامل قطعة', 'حجار', 'عدسة', 'وصلة 2×1', 'وصلة 3×1', 'وصلة 3×3', 'أدبتور', 'وصلة HD', 'دايزك', 'أخرى']));
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = { sortBy, limit: 50 };
        if (selectedCategory !== 'الكل') params.category = selectedCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const { data } = await productAPI.getAll(params);
        setProducts(data.products);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول لتتمكن من إضافة المنتجات إلى سلتك.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#4338ca',
        confirmButtonColor: '#4338ca',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ذهاب لتسجيل الدخول',
        cancelButtonText: 'إلغاء',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: '/cart', message: 'يرجى تسجيل الدخول لإضافة أصناف إلى سلتك.' } });
        }
      });
      return;
    }

    if (product.stock === 0) {
      Swal.fire({ title: 'نفذت الكمية!', text: `للأسف "${product.name}" غير متوفر حالياً.`, icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      return;
    }

    setAddingToCart(product._id);
    try {
      await addToCart(product);
      Swal.fire({
        title: 'تمت الإضافة!',
        text: `تم إضافة ${product.name} إلى السلة بنجاح.`,
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-end',
        toast: true,
        iconColor: '#4338ca',
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'فشل في إضافة المنتج للسلة.';
      Swal.fire({ title: 'خطأ', text: msg, icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
    } finally {
      setAddingToCart(null);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="bg-slate-50 min-h-screen font-['Cairo'] text-right" dir="rtl">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">جميع المنتجات</h1>
          <p className="text-lg text-indigo-100">اكتشف مجموعتنا الواسعة من أجهزة الاستقبال وأطباق الدش وكابلات التوصيل</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 border border-slate-100">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 ml-1" />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim()) {
                    setSearchParams({ search: e.target.value.trim() });
                  } else {
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }
                }}
                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-['Cairo']"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white transition-all font-bold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === 'الكل' ? 'التصنيف: الكل' : cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white transition-all font-bold"
              >
                <option value="default">الترتيب: الافتراضي</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="rating">التقييم: الأعلى أولاً</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-bold">جاري تحميل المنتجات...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-600 font-bold">عرض <span className="text-indigo-600 font-black">{products.length}</span> منتج</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all duration-300 group border border-slate-100 flex flex-col">
                  <div className="h-56 bg-gradient-to-br from-indigo-50 to-slate-100 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl">📦</div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <span className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg">نفذت الكمية</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[56px]">
                      {product.name}
                    </h3>

                    <div className="flex items-center mb-4 gap-1">
                      {renderStars(product.rating || 4.5)}
                      <span className="text-xs text-slate-400 font-['Inter'] mr-2">({product.rating || 4.5})</span>
                    </div>

                    <div className="flex items-center gap-2 mb-6 mt-auto">
                      <span className="text-2xl font-black text-indigo-600 font-['Inter']">{product.price.toLocaleString()} ج.م</span>
                      {product.comparePrice && (
                        <span className="text-slate-400 line-through text-sm font-['Inter']">{product.comparePrice.toLocaleString()} ج.م</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || addingToCart === product._id}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black ${product.stock > 0
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft hover:shadow-indigo-500/25'
                        : 'bg-slate-100 cursor-not-allowed text-slate-400'
                        }`}
                    >
                      {addingToCart === product._id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5 ml-1" />
                      )}
                      {product.stock > 0 ? 'أضف إلى السلة' : 'غير متوفر'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">لم يتم العثور على أي منتج</h3>
            <p className="text-slate-500 mb-6">جرب تغيير كلمات البحث أو اختيار تصنيف آخر</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('الكل'); }}
              className="text-indigo-600 hover:text-indigo-700 font-black flex items-center gap-2 mx-auto border border-indigo-100 px-6 py-2 rounded-xl hover:bg-indigo-50"
            >
              مسح فلاتر البحث
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
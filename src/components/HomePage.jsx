import React from 'react';
import { Search, Truck, Shield, RotateCcw, Star, Antenna, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import Swal from 'sweetalert2';
import satelliteImage from '../assets/Gemini_Generated_Image_7do4k37do4k37do4.png';

const HomePage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState(['قطعة', 'دش', 'ريسيفر', 'ريموت', 'صواميل', 'سلك', 'حامل شاشة', 'حامل قطعة', 'حجار', 'وصلة 2×1', 'وصلة 3×1', 'أدبتور', 'وصلة HD', 'دايزك', 'أخرى']);
  const [selectedCategory, setSelectedCategory] = React.useState('الكل');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await productAPI.getCategories();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = { limit: 12, status: 'active' };
        if (selectedCategory !== 'الكل') {
          params.category = selectedCategory;
        }
        const { data } = await productAPI.getAll(params);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching homepage products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول لتتمكن من إضافة المنتجات إلى سلتك.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#4338ca',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ذهاب لتسجيل الدخول',
        cancelButtonText: 'إلغاء'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: '/', message: 'يرجى تسجيل الدخول لإضافة أصناف إلى سلتك.' } });
        }
      });
      return;
    }

    try {
      await addToCart(product, 1);
      Swal.fire({
        title: 'تمت الإضافة!',
        text: `تم إضافة ${product.name} إلى سلة التسوق بنجاح.`,
        icon: 'success',
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: '#fff',
        iconColor: '#4338ca'
      });
    } catch (error) {
      Swal.fire({
        title: 'خطأ',
        text: error.response?.data?.message || 'فشل في إضافة المنتج للسلة.',
        icon: 'error'
      });
    }
  };

  return (
    <div dir="rtl" className="font-['Cairo'] text-right">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Right side - Text in RTL */}
          <div className="order-2 md:order-1">
            <h1 className="text-6xl font-bold mb-4 text-slate-900 tracking-tight">
              البسيوني
            </h1>
            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
              وجهتك الأولى لأجهزة الاستقبال وأطباق الدش والكابلات وإكسسوارات التركيب — جودة نثق بها .
            </p>

            {/* Search bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="ابحث عن ريسيفر، طبق دش، سلك، قطعة LNB..."
                className="w-full pr-6 pl-12 py-4 border border-slate-200 rounded-2xl bg-white shadow-soft focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-['Cairo'] text-right"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">أفضل سعر</p>
                  <p className="text-sm text-slate-500">مضمون 100%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <RotateCcw className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">إرجاع سهل</p>
                  <p className="text-sm text-slate-500">خلال 30 يوم</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Star className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">جودة فائقة</p>
                  <p className="text-sm text-slate-500">أصلي ومضمون</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left side - Image in RTL context */}
          <div className="hidden md:block order-1 md:order-2">
            <div className="bg-linear-to-br from-indigo-100 to-indigo-50 rounded-3xl h-96 flex items-center justify-center shadow-soft border border-indigo-100 overflow-hidden">
              <img
                src={satelliteImage}
                alt="Satellite Dish"
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* All Items Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-800 border-r-4 border-indigo-600 pr-4">تسوق حسب القسم</h2>
        <div className="flex flex-wrap gap-3 mb-12">
          {['الكل', ...categories].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-bold transition-all shadow-soft active:scale-95 ${selectedCategory === category
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-glow'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Products */}
        <h2 className="text-3xl font-bold mb-8 text-slate-800 border-r-4 border-indigo-600 pr-4">
          {selectedCategory === 'الكل' ? 'أرقى المنتجات' : `منتجات قسم ${selectedCategory}`}
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-slate-500 text-lg">جاري تحميل المنتجات...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {products.map((product, index) => (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 group">
                {/* Product Image Space */}
                <div className="h-56 bg-linear-to-br from-indigo-50 to-slate-100 relative overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{product.category}</span>
                    <div className="flex items-center gap-1 font-['Inter']">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-slate-500">{product.rating || '4.5'}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-indigo-600 transition-colors h-14 overflow-hidden">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-4 font-['Inter']">
                    <span className="text-2xl font-black text-indigo-600 font-['Cairo']">{product.price.toLocaleString()} ج.م</span>
                    {product.oldPrice && (
                      <span className="text-slate-400 line-through text-sm font-['Cairo']">{product.oldPrice.toLocaleString()} ج.م</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-soft hover:shadow-glow"
                  >
                    <ShoppingCart className="w-5 h-5 ml-1" />
                    أضف إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-xl text-slate-500 font-bold mb-2">لا توجد منتجات في هذا القسم حالياً</p>
            <button
              onClick={() => setSelectedCategory('الكل')}
              className="text-indigo-600 font-bold hover:underline"
            >
              استعرض جميع المنتجات
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
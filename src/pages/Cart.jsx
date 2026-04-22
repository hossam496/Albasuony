import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, isCartLoading } = useCart();
  const [updatingItem, setUpdatingItem] = useState(null);
  const navigate = useNavigate();

  const handleRemoveItem = async (itemId, itemName) => {
    const result = await Swal.fire({
      title: 'حذف المنتج؟',
      text: `هل أنت متأكد من حذف "${itemName}" من السلة؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
    });

    if (result.isConfirmed) {
      try {
        await removeFromCart(itemId);
        Swal.fire({ title: 'تم الحذف!', text: `تم حذف ${itemName} بنجاح.`, icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
      } catch {
        Swal.fire({ title: 'خطأ', text: 'فشل في حذف المنتج.', icon: 'error', confirmButtonColor: '#4338ca' });
      }
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setUpdatingItem(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      const msg = error.response?.data?.message || 'فشل في تحديث الكمية.';
      Swal.fire({ title: 'خطأ', text: msg, icon: 'error', confirmButtonColor: '#4338ca' });
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;
    const result = await Swal.fire({
      title: 'تفريغ السلة؟',
      text: 'هل أنت متأكد من رغبتك في إزالة جميع الأصناف؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، أفرغ السلة',
      cancelButtonText: 'إلغاء',
    });

    if (result.isConfirmed) {
      await clearCart();
      Swal.fire({ title: 'تم تفريغ السلة!', icon: 'success', timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
    }
  };

  const handleCheckout = async () => {
    Swal.fire({
      title: 'إتمام الطلب',
      text: 'يرجى إدخال اسمك بالكامل للمتابعة.',
      input: 'text',
      inputPlaceholder: 'مثال: محمد احمد علي',
      showCancelButton: true,
      confirmButtonColor: '#4338ca',
      confirmButtonText: 'تأكيد الطلب',
      cancelButtonText: 'إلغاء',
      inputValidator: (value) => {
        if (!value) {
          return 'يرجى إدخال الاسم'
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const { orderAPI } = await import('../services/api');
          const orderData = {
            shippingAddress: { street: `الاسم: ${result.value}`, city: 'كاش', country: 'مصر' },
            paymentMethod: 'cash',
          };
          await orderAPI.place(orderData);
          await clearCart(); // Clear local and server cart state
          Swal.fire({
            title: 'تم تسجيل الطلب!',
            text: 'تم استلام طلبك بنجاح وجاري المراجعة.',
            icon: 'success',
            confirmButtonColor: '#4338ca',
            confirmButtonText: 'حسناً'
          }).then(() => {
            navigate('/');
          });
        } catch (error) {
          const msg = error.response?.data?.message || 'فشل في إتمام الطلب.';
          Swal.fire({ title: 'خطأ', text: msg, icon: 'error', confirmButtonColor: '#4338ca' });
        }
      }
    });
  };

  if (isCartLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center font-['Cairo']" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 font-['Cairo']" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center border border-slate-100">
            <ShoppingBag className="w-24 h-24 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">سلة التسوق فارغة</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">يبدو أنك لم تضف أي منتج إلى سلتك حتى الآن. تصفح منتجاتنا المميزة وابدأ التسوق!</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-soft hover:shadow-glow">
              متابعة التسوق
              <ArrowLeft className="w-5 h-5 mr-1 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-['Cairo'] text-right" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">سلة التسوق</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-slate-100">
              <div className="p-2 md:p-6 divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex flex-col md:flex-row items-center gap-4 py-6 px-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-right">
                      <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                      <p className="text-sm text-indigo-600 font-bold bg-indigo-50 inline-block px-2 py-0.5 rounded-lg mt-1">{item.category}</p>
                      <div className="mt-2 font-['Inter']">
                        <span className="text-xl font-bold text-slate-800 font-['Cairo']">{item.price.toLocaleString()} ج.م</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={updatingItem === item._id || item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="w-10 text-center font-black text-lg">
                        {updatingItem === item._id ? (
                          <Loader className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={updatingItem === item._id}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <Plus className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    <div className="text-left font-['Inter'] min-w-[120px]">
                      <p className="font-black text-xl text-indigo-600 font-['Cairo']">{(item.price * item.quantity).toLocaleString()} ج.م</p>
                      <button
                        onClick={() => handleRemoveItem(item._id, item.name)}
                        className="text-rose-500 hover:text-rose-600 transition-colors mt-2 flex items-center gap-1 text-sm font-bold font-['Cairo'] mr-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 px-2">
              <Link to="/products" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold group">
                <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                العودة للتسوق
              </Link>
              <button onClick={handleClearCart} className="text-rose-500 hover:text-rose-600 transition-colors font-bold border border-rose-100 px-4 py-2 rounded-xl hover:bg-rose-50">
                تفريغ السلة بالكامل
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-8 sticky top-24 border border-slate-100 flex flex-col gap-6">
              <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">ملخص الطلب</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-bold">المجموع الفرعي</span>
                  <span className="font-bold font-['Inter']">{cartTotal.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-bold">الشحن</span>
                  <span className="text-emerald-600 font-bold">مجاني</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-slate-800">الإجمالي</span>
                    <span className="text-3xl font-black text-indigo-600 font-['Inter']">
                      {cartTotal.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 font-black shadow-soft hover:shadow-indigo-500/25"
              >
                <CreditCard className="w-6 h-6 ml-1" />
                إتمام عملية الشراء
              </button>

              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  بإتمامك للشراء أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بمتجر البسيوني.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
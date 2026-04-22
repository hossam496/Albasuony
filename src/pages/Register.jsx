import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      Swal.fire({ title: 'خطأ!', text: 'يرجى ملء جميع الحقول', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire({ title: 'خطأ!', text: 'كلمات المرور غير متطابقة', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      return;
    }
    if (password.length < 6) {
      Swal.fire({ title: 'خطأ!', text: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل', icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, password });
      login(data.user, data.accessToken);

      Swal.fire({
        title: 'تم إنشاء الحساب!',
        text: `أهلاً بك في البسيوني، ${data.user.name}!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });

      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
      Swal.fire({ title: 'فشل التسجيل', text: msg, icon: 'error', confirmButtonColor: '#4338ca', confirmButtonText: 'موافق' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 font-['Cairo']" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-soft-lg p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">إنشاء حساب</h2>
          <p className="text-slate-500 mt-2">سجل الآن للبدء بالتسوق معنا</p>
        </div>

        <form onSubmit={handleSubmit} className="text-right">
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">الاسم بالكامل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ml-1" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-['Cairo'] text-right"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">البريد الإلكتروني</label>
            <div className="relative font-['Inter']">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ml-1" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right"
                placeholder="example@domain.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2 font-['Cairo']">كلمة المرور</label>
            <div className="relative font-['Inter']">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ml-1" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right"
                placeholder="••••••••"
                dir="ltr"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2 font-['Cairo']">تأكيد كلمة المرور</label>
            <div className="relative font-['Inter']">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ml-1" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right"
                placeholder="••••••••"
                dir="ltr"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-soft hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5 ml-1" />
                إنشاء حساب
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 font-bold">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
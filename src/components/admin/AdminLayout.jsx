import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  ShoppingCart,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Globe
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
    { name: 'المنتجات', path: '/admin/products', icon: Package },
    { name: 'المخزون', path: '/admin/inventory', icon: Warehouse },
    { name: 'المستخدمين', path: '/admin/users', icon: Users },
    { name: 'الطلبات', path: '/admin/orders', icon: ShoppingCart },
    { name: 'العودة للموقع', path: '/', icon: Globe, isExternal: true },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'لوحة التحكم';
    if (path.includes('/admin/products')) return 'إدارة المنتجات';
    if (path.includes('/admin/inventory')) return 'إدارة المخزون والمستودع';
    if (path.includes('/admin/users')) return 'دليل المستخدمين';
    if (path.includes('/admin/orders')) return 'إدارة الطلبات';
    return 'لوحة التحكم';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-['Cairo']" dir="rtl">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-l border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-20'
          }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-[#4338ca] rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl text-slate-800 font-logo">البسيوني</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === navItems.length - 1;
              const isActive = !item.isExternal && (location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path)));

              return (
                <React.Fragment key={item.name}>
                  {isLast && item.isExternal && <div className="my-4 border-t border-slate-100 mx-4" />}
                  <li>
                    <NavLink
                      to={item.path}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                          ? 'bg-[#4338ca]/10 text-[#4338ca] font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        } ${!isSidebarOpen && 'justify-center'}`
                      }
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#4338ca]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {isSidebarOpen && (
                        <span className="text-sm">{item.name}</span>
                      )}
                      {isActive && isSidebarOpen && (
                        <ChevronRight className="w-4 h-4 mr-auto text-[#4338ca] rotate-180" />
                      )}
                    </NavLink>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors ${!isSidebarOpen && 'justify-center w-full'
              }`}
          >
            {isSidebarOpen ? (
              <>
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm">طي القائمة</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5 rotate-180" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-200 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4338ca] rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 font-logo">البسيوني</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === navItems.length - 1;
              const isActive = !item.isExternal && (location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path)));

              return (
                <React.Fragment key={item.name}>
                  {isLast && item.isExternal && <div className="my-4 border-t border-slate-100" />}
                  <li>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-[#4338ca]/10 text-[#4338ca] font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#4338ca]' : 'text-slate-400'}`} />
                      <span className="text-sm">{item.name}</span>
                    </NavLink>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
              <p className="text-sm text-slate-500 hidden sm:block">أهلاً بك مرة أخرى</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="بحث سريع..."
                className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 left-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{user?.name || 'مسؤول النظام'}</p>
                <p className="text-xs text-slate-500 lowercase">{user?.email || 'admin@albasuony.com'}</p>
              </div>
              <div className="w-10 h-10 bg-[#4338ca] rounded-xl flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'ب'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

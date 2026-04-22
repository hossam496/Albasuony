import React, { useState } from 'react';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Product', path: '/products' },
    { name: 'Contact', path: '/contact' },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header className="glassmorphism text-slate-700 shadow-soft sticky top-0 z-50 border-b border-slate-200/50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-black px-4 py-2 rounded-xl shadow-soft hover:shadow-glow transition-all duration-300 font-logo">
              البسيوني
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium text-lg relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all hover:after:w-full"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Cart Icon */}
            <Link to="/cart" className="relative text-slate-600 hover:text-indigo-600 transition-colors duration-200 p-2 rounded-lg hover:bg-indigo-50">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0 -right-0 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login/Logout Button */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-4 py-2 rounded-xl transition-all duration-200 font-semibold border border-slate-200 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-semibold shadow-soft hover:shadow-glow"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-600 hover:text-indigo-600 transition-colors duration-200 p-2 rounded-lg hover:bg-indigo-50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block py-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <Link
                to="/cart"
                className="flex items-center justify-between w-full py-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Shopping Cart</span>
                {cartCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full py-2 text-slate-600 hover:text-red-600 transition-colors duration-200"
                >
                  <span>Logout ({user?.name})</span>
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-between w-full py-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Login</span>
                  <User className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
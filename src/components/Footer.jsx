import React from 'react';
import { Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-indigo-950 text-white mt-16">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6 text-indigo-400" />
              <h3 className="text-2xl font-bold font-logo">البسيوني</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Your one-stop shop for satellite and receiver equipment. Best quality, best prices, fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-slate-400 hover:text-indigo-400 transition-colors">Home</a></li>
              <li><a href="/products" className="text-slate-400 hover:text-indigo-400 transition-colors">Products</a></li>
              <li><a href="/contact" className="text-slate-400 hover:text-indigo-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">Receivers</li>
              <li className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">Satellite Dishes</li>
              <li className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">LNB</li>
              <li className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">Cables</li>
              <li className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">Switches</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span>123 Satellite St, Cairo, Egypt</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-indigo-400" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>info@albasuony.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-indigo-900 mt-8 pt-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Subscribe to our newsletter</h3>
              <p className="text-slate-400">Get the latest updates on new products and special offers</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-900/50 text-white border border-indigo-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button className="bg-indigo-600 px-6 py-2 rounded-xl hover:bg-indigo-500 transition-colors font-medium shadow-soft">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-indigo-900 mt-8 pt-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} البسيوني. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
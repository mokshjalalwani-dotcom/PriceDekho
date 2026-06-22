import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useCategory } from '../../context/CategoryContext';

const Footer = () => {
  const { categories } = useCategory();
  // Split categories into two columns
  const catCol1 = categories.slice(0, 6);
  const catCol2 = categories.slice(6, 12);

  return (
    <footer className="bg-[var(--color-secondary)] text-gray-300 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-[42px] h-[42px] rounded-lg flex items-center justify-center overflow-hidden bg-white p-1">
                <img src="/logo.png" alt="Satguru Electricals Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">Satguru<span style={{ color: 'rgb(123,63,0)' }}>Electricals</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mt-4">
              Your trusted partner for premium home appliances & electronics. Quality products, competitive prices, and exceptional service since 1995.
            </p>
            <p className="text-[11px] text-gray-500 mt-2 uppercase tracking-wider font-medium">Trusted by families across Gujarat</p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-1/2 after:h-1 after:bg-[var(--color-primary)] after:rounded-full">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">Home</Link></li>
              <li><Link to="/shop" className="hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">Shop Products</Link></li>
              <li><Link to="/shop" className="hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">All Categories</Link></li>
              <li><Link to="/compare" className="hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">Compare Products</Link></li>
              <li><Link to="/cart" className="hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">Cart</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-1/2 after:h-1 after:bg-[var(--color-primary)] after:rounded-full">Top Categories</h3>
            <ul className="space-y-3">
              {catCol1.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} className="hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-1/2 after:h-1 after:bg-[var(--color-primary)] after:rounded-full">Contact Us</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="text-[var(--color-primary)] shrink-0 mt-1" size={20} />
                <span className="text-sm">
                  <a className="no-underline hover:text-[var(--color-primary)] transition-colors" href="https://maps.app.goo.gl/4DD5ZJtqQZTtkvGs7" target="_blank" rel="noopener noreferrer">
                    Parsiwad Main Bazaar, Near Kabutar Khana, Vyara, Gujarat - 394650
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--color-primary)] shrink-0" size={20} />
                <span className="text-sm">+91 90330 33900</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[var(--color-primary)] shrink-0" size={20} />
                <span className="text-sm">satguruelectricals.online@gmail.com</span>
              </li>
            </ul>

            {/* More Categories */}
            <h4 className="text-white font-semibold text-sm mb-3">More Categories</h4>
            <ul className="space-y-2">
              {catCol2.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} className="text-sm hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Satguru Electricals. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from 'react-router-dom';
import { Flame, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                Quick<span className="text-brand-400">Bite</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Craving piping hot Hyderabadi biriyani, stone-baked pizzas, crispy dosas, or Belgian
              desserts? QuickBite delivers freshly prepared meals straight from our kitchen to your
              doorstep.
            </p>
            <p className="mt-4 inline-block text-xs px-3 py-1 rounded-full bg-charcoal-800 text-orange-300 border border-charcoal-800">
              Demo Showcase • Cash on Delivery &amp; Simulated Demo Payments Only
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-brand-400 transition">
                  Full Menu
                </Link>
              </li>
              <li>
                <Link to="/menu?category=biriyani" className="hover:text-brand-400 transition">
                  Royal Biriyani
                </Link>
              </li>
              <li>
                <Link to="/menu?category=south-indian" className="hover:text-brand-400 transition">
                  South Indian Classics
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-400 transition">
                  Track My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Indiranagar, Bengaluru 560038</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 80 4123 9800</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@quickbite.example</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} QuickBite Food Delivery. All rights reserved.</p>
          <p>Free delivery on orders above &#8377;499</p>
        </div>
      </div>
    </footer>
  );
}

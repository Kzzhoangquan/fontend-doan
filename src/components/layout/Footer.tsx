'use client';

import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-(--color-primary-blue) to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DĐQ</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Hệ thống quản lý nội bộ doanh nghiệp 
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-(--color-primary-blue) text-gray-600 hover:text-white flex items-center justify-center transition-all"
                title="Github"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-(--color-primary-blue) text-gray-600 hover:text-white flex items-center justify-center transition-all"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {[
                { label: 'Trang chủ', href: '/dashboard' }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-(--color-primary-blue) transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-(--color-primary-blue) transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 text-(--color-primary-blue) shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-(--color-primary-blue) shrink-0" />
                <a href="tel:+84123456789" className="hover:text-(--color-primary-blue) transition-colors">
                  +84 665 657 41
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-(--color-primary-blue) shrink-0" />
                <a href="https://ptit.edu.vn/" className="hover:text-(--color-primary-blue) transition-colors">
                  support@dđq.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            © {currentYear} ERP System. Made with 
            <Heart className="w-4 h-4 text-red-500 fill-current inline-block mx-1" />
            by <span className="font-semibold text-gray-900">509 Ktx Team</span>
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-(--color-primary-blue) transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-(--color-primary-blue) transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-(--color-primary-blue) transition-colors">
              Hỗ trợ
            </a>
          </div>
        </div>

        {/* Version Badge */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-linear-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full text-xs font-medium text-gray-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Version 1.0.0 - Stable
          </span>
        </div>
      </div>
    </footer>
  );
}
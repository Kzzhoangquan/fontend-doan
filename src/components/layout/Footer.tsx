'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>© {currentYear} HR Management System. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-900 transition">Privacy</a>
          <a href="#" className="hover:text-gray-900 transition">Terms</a>
          <a href="#" className="hover:text-gray-900 transition">Support</a>
        </div>
      </div>
    </footer>
  );
}
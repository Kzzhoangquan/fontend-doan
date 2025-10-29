'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Command } from 'lucide-react';

export default function KeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const shortcuts = [
    { keys: ['Ctrl', 'B'], description: 'Ẩn/Hiện sidebar' },
    { keys: ['/'], description: 'Focus vào ô tìm kiếm' },
    { keys: ['Ctrl', 'K'], description: 'Hiện danh sách phím tắt' },
    { keys: ['↑', '↓'], description: 'Di chuyển trong kết quả tìm kiếm' },
    { keys: ['Enter'], description: 'Chọn kết quả tìm kiếm' },
    { keys: ['Esc'], description: 'Đóng modal/tìm kiếm' },
  ];

  return (
    <>
      {/* Floating button to show shortcuts */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 right-6 p-3 bg-[var(--color-primary-blue)] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="Phím tắt (Ctrl+K)"
      >
        <Command className="w-5 h-5" />
      </button>

      <Modal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        title="⌨️ Phím tắt"
        size="md"
      >
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">{shortcut.description}</span>
              <div className="flex gap-2">
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Mẹo:</strong> Sử dụng phím tắt để làm việc nhanh hơn!
          </p>
        </div>
      </Modal>
    </>
  );
}
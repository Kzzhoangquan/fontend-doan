import React, { memo } from 'react';

// Định nghĩa props
type PriorityIconProps = {
    /**
     * Tên độ ưu tiên (ví dụ: 'High', 'Medium', 'Low').
     * Tên này phải khớp với tên file SVG trong public/project/priorities/{name}.svg
     */
    name: string; 
    /**
     * Kích thước icon (Tailwind class, ví dụ: 'w-4 h-4' cho 16x16)
     */
    sizeClass?: string;
    /**
     * Class bổ sung cho styling
     */
    className?: string;
};

const PriorityIcon = memo(function PriorityIcon({ 
    name, 
    sizeClass = 'w-4 h-4', 
    className = '' 
}: PriorityIconProps) {
    
    // 1. Chuẩn hóa đầu vào (thường là chữ thường hoặc loại bỏ khoảng trắng,
    // tùy thuộc vào cách bạn đặt tên file. Giả sử file được đặt tên theo chữ thường)
    const normalizedName = name.toLowerCase().replace(/\s/g, '_'); // Ví dụ: 'Very High' -> 'very_high'

    // 2. Tạo đường dẫn tương đối đến file SVG trong thư mục public
    // Ví dụ: /project/priorities/high.svg
    const iconPath = `/project/priorities/${normalizedName}.svg`;

    return (
        // Sử dụng thẻ <img> để hiển thị SVG
        <img 
            src={iconPath} 
            alt={`${name} priority icon`} 
            className={`${sizeClass} ${className} flex-shrink-0`} // flex-shrink-0 để icon không bị co lại
        />
    );
});

export { PriorityIcon };
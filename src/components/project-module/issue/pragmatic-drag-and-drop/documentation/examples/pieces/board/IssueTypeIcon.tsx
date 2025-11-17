import { memo } from 'react';

// Định nghĩa props
type IssueTypeIconProps = {
    /**
     * Loại issue: 'bug', 'feature', 'request', 'story', 'task'.
     * Tên này phải khớp với tên file SVG trong public/issue/{type}.svg
     */
    type: string; 
    /**
     * Kích thước icon (Tailwind class, ví dụ: 'w-4 h-4' cho 16x16)
     */
    sizeClass?: string;
    /**
     * Class bổ sung cho styling
     */
    className?: string;
};

const IssueTypeIcon = memo(function IssueTypeIcon({ 
    type, 
    sizeClass = 'w-4 h-4', 
    className = '' 
}: IssueTypeIconProps) {
    
    // 1. Chuẩn hóa đầu vào (đảm bảo chữ thường để khớp với tên file)
    const normalizedType = type.toLowerCase();

    // 2. Tạo đường dẫn tương đối đến file SVG trong thư mục public
    // Ví dụ: /issue/bug.svg, /issue/story.svg
    const iconPath = `/project/issue/${normalizedType}.svg`;

    return (
        // Dùng thẻ <img> để hiển thị SVG.
        // Tailwind được sử dụng để kiểm soát kích thước và style bổ sung.
        <img 
            src={iconPath} 
            alt={`${type} issue type icon`} 
            className={`${sizeClass} ${className} flex-shrink-0`} // flex-shrink-0 để icon không bị co lại
        />
    );
});

export { IssueTypeIcon };

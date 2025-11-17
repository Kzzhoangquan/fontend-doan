import { memo } from 'react';

type EpicTagProps = {
    epic_name?: string;
};

const EpicTag = memo(function EpicTag({ epic_name }: EpicTagProps) {
    if (!epic_name) {
        return null;
    }

    const tailwindClasses = `
        inline-block 
        border 
        border-gray-300 
        
        bg-purple-100 
        text-purple-700 
        px-2 
        py-0.5 
        rounded-sm 
        uppercase 
        text-xs 
        font-semibold 
        
        select-none 
        pointer-events-none 
        truncate
    `;

    return (
        <div className={tailwindClasses}>
            {epic_name}
        </div>
    );
});

export { EpicTag };
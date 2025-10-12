// File: src/components/ui/button.tsx

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  ...rest
}) => {
  let baseClasses =
    'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition';

  let variantClasses = '';

  switch (variant) {
    case 'secondary':
      variantClasses =
        'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400';
      break;
    case 'outline':
      variantClasses =
        'border border-blue-700 text-blue-700 hover:bg-blue-50 focus:ring-blue-500';
      break;
    case 'primary':
    default:
      variantClasses =
        'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-600';
      break;
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${className || ''}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;

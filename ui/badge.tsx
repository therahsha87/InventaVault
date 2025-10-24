// File: src/components/ui/badge.tsx

import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-200 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

const Badge: React.FC<BadgeProps> = ({ text, variant = 'default', className }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className || ''}`}
    >
      {text}
    </span>
  );
};

export default Badge;

// File: src/components/ui/card.tsx

import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className }) => {
  return (
    <div
      className={`border border-gray-300 rounded-lg shadow-sm p-6 bg-white ${className || ''}`}
      style={{ maxWidth: '480px', margin: 'auto' }}
    >
      <h2 className="text-xl font-semibold text-blue-700 mb-2">{title}</h2>
      {subtitle && (
        <h3 className="text-md text-gray-600 mb-4 italic">{subtitle}</h3>
      )}
      <div className="text-gray-800">{children}</div>
    </div>
  );
};

export default Card;

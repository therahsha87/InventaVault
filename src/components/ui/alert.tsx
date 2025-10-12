// File: src/components/ui/alert.tsx

import React from 'react';

interface AlertProps {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const variantStyles = {
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  success: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  error: 'bg-red-100 text-red-800 border-red-300',
};

const Alert: React.FC<AlertProps> = ({ message, variant = 'info', className }) => {
  return (
    <div
      className={`border-l-4 p-4 rounded-md ${variantStyles[variant]} ${className || ''}`}
      role="alert"
    >
      <p>{message}</p>
    </div>
  );
};

export default Alert;

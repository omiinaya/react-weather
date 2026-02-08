'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: { width: '16px', height: '16px', borderWidth: '2px' },
    md: { width: '32px', height: '32px', borderWidth: '3px' },
    lg: { width: '48px', height: '48px', borderWidth: '4px' },
  };

  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{spinKeyframes}</style>
      <div
        className={`inline-block rounded-full border-solid ${className || ''}`}
        style={{
          ...sizeStyles[size],
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite',
        }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
};

// Loading overlay component
export const LoadingOverlay: React.FC<{
  isLoading?: boolean;
  message?: string;
}> = ({ isLoading = false, message = 'Loading...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-card-foreground font-medium">{message}</p>
      </div>
    </div>
  );
};

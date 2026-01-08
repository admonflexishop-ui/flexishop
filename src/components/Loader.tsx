'use client';

import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loader({ size = 'md', className = '', text }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-neutral-200 border-t-neutral-600 rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
      {text && <p className="text-sm text-neutral-600">{text}</p>}
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }: Omit<LoaderProps, 'text'>) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-neutral-200 border-t-neutral-600 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

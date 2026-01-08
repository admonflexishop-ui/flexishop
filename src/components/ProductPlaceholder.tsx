'use client';

import React from 'react';

interface ProductPlaceholderProps {
  className?: string;
}

export function ProductPlaceholder({ className = '' }: ProductPlaceholderProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-white ${className}`}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-60"
      >
        {/* Hoja de papel en la parte superior */}
        <rect
          x="45"
          y="25"
          width="30"
          height="20"
          rx="1"
          stroke="#1E3A8A"
          strokeWidth="2"
          fill="none"
        />
        {/* Esquina diagonal del papel */}
        <path
          d="M70 25 L75 30 L70 30 Z"
          stroke="#1E3A8A"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        
        {/* Abertura del dispositivo (slot) */}
        <path
          d="M35 45 Q60 50 85 45"
          stroke="#1E3A8A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Cuerpo principal del dispositivo */}
        <rect
          x="30"
          y="50"
          width="60"
          height="50"
          rx="2"
          stroke="#1E3A8A"
          strokeWidth="2"
          fill="#1E3A8A"
        />
        
        {/* Fila superior de círculos (5 círculos) */}
        <circle cx="42" cy="65" r="3" fill="#FFFFFF" />
        <circle cx="50" cy="65" r="3" fill="#FFFFFF" />
        <circle cx="58" cy="65" r="3" fill="#FFFFFF" />
        <circle cx="66" cy="65" r="3" fill="#FFFFFF" />
        <circle cx="74" cy="65" r="3" fill="#FFFFFF" />
        
        {/* Fila inferior de círculos (3 círculos) */}
        <circle cx="50" cy="80" r="3" fill="#FFFFFF" />
        <circle cx="60" cy="80" r="3" fill="#FFFFFF" />
        <circle cx="70" cy="80" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

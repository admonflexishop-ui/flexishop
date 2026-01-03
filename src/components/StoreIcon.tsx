'use client';

import React from 'react';

interface StoreIconProps {
  accentColor?: string;
  size?: number;
  className?: string;
}

/**
 * Convierte un color HEX a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Ajusta el brillo de un color RGB
 */
function adjustBrightness(rgb: { r: number; g: number; b: number }, percent: number) {
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)))),
  };
}

/**
 * Convierte RGB a HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Genera un gradiente basado en el accent color
 * Similar al efecto de la imagen: de un color más oscuro/intenso a uno más claro/bright
 */
function generateGradient(accentColor: string): string {
  const rgb = hexToRgb(accentColor);
  if (!rgb) return `linear-gradient(135deg, ${accentColor} 0%, ${accentColor} 100%)`;

  // Crear un gradiente de izquierda-arriba (más oscuro) a derecha-abajo (más claro)
  // Aumentar el brillo en ~30-40% para el segundo color
  const lighter = adjustBrightness(rgb, 35);
  const lighterHex = rgbToHex(lighter.r, lighter.g, lighter.b);

  return `linear-gradient(135deg, ${accentColor} 0%, ${lighterHex} 100%)`;
}

export function StoreIcon({ accentColor = '#F59E0B', size = 32, className = '' }: StoreIconProps) {
  const gradient = generateGradient(accentColor);

  return (
    <div
      className={`rounded-lg flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: gradient,
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 223 207"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(0,207) scale(0.1,-0.1)" fill="white" stroke="none">
          <path d="M536 1725 c-51 -18 -86 -44 -113 -84 -21 -31 -85 -222 -98 -292 -9
          -47 10 -113 45 -164 l29 -42 3 -314 c3 -276 5 -319 21 -354 23 -51 52 -81 102
          -108 39 -22 50 -22 559 -25 582 -3 582 -3 649 66 66 67 67 76 67 425 0 298 1
          315 19 331 34 31 61 102 61 161 0 67 -60 263 -98 318 -14 21 -46 50 -71 65
          l-46 27 -545 2 c-450 2 -552 0 -584 -12z m184 -122 c0 -21 -7 -100 -14 -175
          -16 -153 -33 -195 -89 -224 -42 -22 -110 -14 -144 17 -31 30 -53 71 -53 101 0
          28 56 211 77 251 24 47 68 67 151 67 l72 0 0 -37z m330 -148 l0 -185 -34 -38
          c-32 -34 -38 -37 -91 -37 -53 0 -59 3 -91 37 -40 44 -42 68 -23 281 l12 127
          114 0 113 0 0 -185z m350 26 c14 -177 10 -218 -23 -248 -51 -47 -100 -55 -156
          -25 -63 34 -71 64 -71 259 l0 173 118 0 119 0 13 -159z m260 144 c16 -8 35
          -25 41 -37 25 -47 79 -224 79 -260 0 -110 -113 -174 -200 -115 -56 37 -67 68
          -79 217 -6 74 -13 152 -16 173 l-5 37 75 0 c48 0 87 -6 105 -15z m-785 -526
          c68 -15 135 0 187 42 l37 30 41 -30 c95 -68 218 -62 301 15 l26 24 19 -21 c34
          -38 95 -62 156 -63 l58 -1 0 -127 0 -128 -600 0 -600 0 0 128 0 127 64 1 c64
          1 133 29 165 68 12 14 18 12 53 -19 26 -22 60 -38 93 -46z m825 -469 l0 -110
          -34 -38 -34 -37 -519 -3 c-506 -2 -519 -2 -551 18 -47 29 -62 73 -62 185 l0
          95 600 0 600 0 0 -110z"/>
        </g>
      </svg>
    </div>
  );
}


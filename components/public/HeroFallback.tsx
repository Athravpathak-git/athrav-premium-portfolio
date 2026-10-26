import React from 'react';

export function HeroFallback() {
  return (
    <div className="relative w-full h-[400px] sm:h-[480px] flex items-center justify-center select-none pointer-events-none">
      {/* Studio Contact Shadow on Cream Ground */}
      <div className="absolute bottom-10 w-56 h-8 rounded-full bg-charcoal/10 blur-xl" />

      {/* Stylized Burgundy Glass Ribbon Graphic with Rose Gold Trim */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full drop-shadow-[0_20px_35px_rgba(87,38,51,0.22)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Burgundy Translucent Glass Gradient */}
            <linearGradient id="burgundyGlassFront" x1="40" y1="40" x2="280" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#753244" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#572633" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#361720" stopOpacity="0.96" />
            </linearGradient>

            <linearGradient id="burgundyGlassBack" x1="280" y1="60" x2="60" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#461E29" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#572633" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#261016" stopOpacity="0.9" />
            </linearGradient>

            {/* Rose Gold Metallic Edge Trim */}
            <linearGradient id="roseGoldTrim" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DCB5AB" />
              <stop offset="40%" stopColor="#C18E83" />
              <stop offset="70%" stopColor="#F4E7E4" />
              <stop offset="100%" stopColor="#A86D61" />
            </linearGradient>
          </defs>

          {/* Background Ribbon Loop (Inner sweeping fold) */}
          <path
            d="M95 180 C60 110, 110 50, 185 65 C240 75, 270 145, 225 210 C190 260, 120 265, 85 220"
            fill="url(#burgundyGlassBack)"
            stroke="url(#roseGoldTrim)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Foreground Ribbon Swirl (Sculptural twist with soft specular highlight) */}
          <path
            d="M80 135 C115 70, 205 60, 245 125 C280 180, 225 255, 155 255 C95 255, 60 205, 80 135 Z"
            fill="url(#burgundyGlassFront)"
            stroke="url(#roseGoldTrim)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Specular light catch reflection on glass curve */}
          <path
            d="M110 100 C145 75, 195 78, 225 110"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

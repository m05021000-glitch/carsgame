import React from 'react';

interface TruckSvgProps {
  truckId: string;
  isNitro: boolean;
  speed: number;
  className?: string;
}

export const TruckSvg: React.FC<TruckSvgProps> = ({ truckId, isNitro, speed, className = '' }) => {
  const wheelSpinSpeed = Math.max(0.1, 1.2 - (speed / 200) * 0.9);

  if (truckId === 'truck_scooter') {
    return (
      <div className={`relative inline-block ${className}`}>
        <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Exhaust flame if high speed or nitro */}
          {(isNitro || speed > 110) && (
            <g className="animate-pulse">
              <path
                d="M 5 68 Q -20 68 -30 65 Q -18 72 5 70 Z"
                fill={isNitro ? '#06B6D4' : '#F97316'}
                className="filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
              />
              <path
                d="M 5 68 Q -12 68 -18 66 Q -10 70 5 69 Z"
                fill="#FEF08A"
              />
            </g>
          )}

          {/* Delivery Box at Rear */}
          <rect x="20" y="30" width="38" height="34" rx="4" fill="#047857" stroke="#065F46" strokeWidth="2" />
          <rect x="25" y="34" width="28" height="8" rx="2" fill="#10B981" />
          <text x="39" y="56" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">快</text>

          {/* Scooter Body Frame */}
          <path d="M 50 64 L 75 64 L 92 48 L 105 48" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 90 48 L 98 28 L 92 24" stroke="#047857" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Driver Silhouette with helmet */}
          <circle cx="80" cy="28" r="11" fill="#1E293B" />
          <path d="M 83 26 Q 91 26 91 30" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <path d="M 74 40 C 74 38 78 36 84 37 L 94 48 L 74 54 Z" fill="#0F766E" />

          {/* Front Light */}
          <polygon points="105,42 155,30 155,60 105,52" fill="url(#headlightGlow)" opacity="0.35" />
          <circle cx="104" cy="46" r="4" fill="#FEF08A" />

          {/* Rear Wheel */}
          <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '32px 72px' }}>
            <circle cx="32" cy="72" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="32" cy="72" r="6" fill="#94A3B8" />
            <line x1="32" y1="58" x2="32" y2="86" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="18" y1="72" x2="46" y2="72" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>

          {/* Front Wheel */}
          <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '110px 72px' }}>
            <circle cx="110" cy="72" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="110" cy="72" r="6" fill="#94A3B8" />
            <line x1="110" y1="58" x2="110" y2="86" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="96" y1="72" x2="124" y2="72" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>

          <defs>
            <linearGradient id="headlightGlow" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (truckId === 'truck_blackcat') {
    return (
      <div className={`relative inline-block ${className}`}>
        <svg viewBox="0 0 190 100" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Turbo Flames */}
          {(isNitro || speed > 100) && (
            <g className="animate-pulse">
              <path
                d="M 12 62 Q -15 62 -28 58 Q -12 68 12 65 Z"
                fill={isNitro ? '#38BDF8' : '#F97316'}
                className="filter drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
              />
              <path
                d="M 12 62 Q -6 62 -14 60 Q -6 65 12 64 Z"
                fill="#E0F2FE"
              />
            </g>
          )}

          {/* Truck Body - Aerodynamic Black Cat Design */}
          <path
            d="M 16 68 L 16 32 C 16 28 20 25 25 25 L 115 25 L 138 42 L 168 46 C 172 47 175 51 175 55 L 175 68 Z"
            fill="#0F172A"
            stroke="#0284C7"
            strokeWidth="2.5"
          />

          {/* Cyan Cyber Stripe */}
          <path d="M 20 54 L 115 54 L 142 58 L 174 58" stroke="#38BDF8" strokeWidth="3" />
          
          {/* Window */}
          <path d="M 117 30 L 134 44 L 117 44 Z" fill="#38BDF8" opacity="0.6" />
          <path d="M 136 44 L 162 47 L 162 53 L 136 53 Z" fill="#0EA5E9" opacity="0.8" />

          {/* Black Cat Eyes Logo on Van Body */}
          <g transform="translate(52, 33)">
            <ellipse cx="14" cy="11" rx="4" ry="7" transform="rotate(-15 14 11)" fill="#38BDF8" />
            <ellipse cx="28" cy="11" rx="4" ry="7" transform="rotate(15 28 11)" fill="#38BDF8" />
            <polygon points="21,17 18,21 24,21" fill="#F43F5E" />
            <text x="21" y="27" fill="#E2E8F0" fontSize="6" fontWeight="bold" textAnchor="middle">SHADOW</text>
          </g>

          {/* Headlight beam */}
          <polygon points="175,52 230,42 230,78 175,64" fill="url(#cyanLightGlow)" opacity="0.4" />
          <circle cx="173" cy="58" r="4" fill="#38BDF8" />

          {/* Wheels with Custom Cyan Rim */}
          <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '48px 70px' }}>
            <circle cx="48" cy="70" r="16" fill="#020617" stroke="#38BDF8" strokeWidth="2.5" />
            <circle cx="48" cy="70" r="7" fill="#1E293B" />
            <line x1="48" y1="54" x2="48" y2="86" stroke="#38BDF8" strokeWidth="2" />
            <line x1="32" y1="70" x2="64" y2="70" stroke="#38BDF8" strokeWidth="2" />
          </g>

          <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '144px 70px' }}>
            <circle cx="144" cy="70" r="16" fill="#020617" stroke="#38BDF8" strokeWidth="2.5" />
            <circle cx="144" cy="70" r="7" fill="#1E293B" />
            <line x1="144" y1="54" x2="144" y2="86" stroke="#38BDF8" strokeWidth="2" />
            <line x1="128" y1="70" x2="160" y2="70" stroke="#38BDF8" strokeWidth="2" />
          </g>

          <defs>
            <linearGradient id="cyanLightGlow" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (truckId === 'truck_espresso') {
    return (
      <div className={`relative inline-block ${className}`}>
        <svg viewBox="0 0 190 105" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Turbo Steam & Fire */}
          {(isNitro || speed > 100) && (
            <g className="animate-pulse">
              <path
                d="M 10 65 Q -20 65 -32 60 Q -15 72 10 68 Z"
                fill={isNitro ? '#F59E0B' : '#DC2626'}
                className="filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              />
              <circle cx="30" cy="18" r="6" fill="#FEF3C7" opacity="0.6" />
              <circle cx="20" cy="10" r="8" fill="#FEF3C7" opacity="0.4" />
            </g>
          )}

          {/* Espresso Machine on Roof */}
          <rect x="35" y="16" width="60" height="15" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
          <rect x="42" y="10" width="16" height="6" rx="1" fill="#D97706" />
          <rect x="68" y="10" width="16" height="6" rx="1" fill="#D97706" />
          {/* Coffee Cup Symbol */}
          <path d="M 98 22 C 98 19 105 19 105 22 C 105 25 98 25 98 22" stroke="#FEF3C7" strokeWidth="1.5" />

          {/* Heavy Truck Body */}
          <path
            d="M 12 70 L 12 30 C 12 28 15 26 18 26 L 120 26 L 140 44 L 170 47 C 174 48 178 52 178 56 L 178 70 Z"
            fill="#78350F"
            stroke="#92400E"
            strokeWidth="3"
          />
          {/* Gold Trim */}
          <rect x="18" y="32" width="98" height="28" rx="2" fill="#92400E" />
          <text x="67" y="50" fill="#FEF3C7" fontSize="12" fontWeight="800" textAnchor="middle">ESPRESSO 4x4</text>
          <text x="67" y="58" fill="#FDE68A" fontSize="7" fontWeight="bold" textAnchor="middle">提神特濃重裝車</text>

          {/* Cabin Windshield */}
          <path d="M 122 30 L 138 45 L 122 45 Z" fill="#FDE68A" opacity="0.65" />
          <path d="M 140 45 L 166 48 L 166 54 L 140 54 Z" fill="#FDE68A" opacity="0.8" />

          {/* Big Offroad Wheels */}
          <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '48px 72px' }}>
            <circle cx="48" cy="72" r="18" fill="#1C1917" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="48" cy="72" r="7" fill="#78350F" />
            <line x1="48" y1="54" x2="48" y2="90" stroke="#FBBF24" strokeWidth="2.5" />
            <line x1="30" y1="72" x2="66" y2="72" stroke="#FBBF24" strokeWidth="2.5" />
          </g>

          <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '144px 72px' }}>
            <circle cx="144" cy="72" r="18" fill="#1C1917" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="144" cy="72" r="7" fill="#78350F" />
            <line x1="144" y1="54" x2="144" y2="90" stroke="#FBBF24" strokeWidth="2.5" />
            <line x1="126" y1="72" x2="162" y2="72" stroke="#FBBF24" strokeWidth="2.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Default: Classic Yellow Courier Truck
  return (
    <div className={`relative inline-block ${className}`}>
      <svg viewBox="0 0 180 95" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Turbo Exhaust Flame */}
        {(isNitro || speed > 105) && (
          <g className="animate-pulse">
            <path
              d="M 10 60 Q -15 60 -26 56 Q -10 65 10 63 Z"
              fill={isNitro ? '#06B6D4' : '#F97316'}
              className="filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
            />
            <path
              d="M 10 60 Q -5 60 -12 58 Q -5 63 10 62 Z"
              fill="#FEF08A"
            />
          </g>
        )}

        {/* Cargo Box */}
        <rect x="14" y="24" width="100" height="42" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
        
        {/* Coffee Cup / Lightning Badge on Cargo Box */}
        <g transform="translate(42, 30)">
          <rect x="0" y="4" width="22" height="20" rx="3" fill="#FFFFFF" />
          <path d="M 22 8 C 26 8 26 16 22 16" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <path d="M 11 8 L 8 15 L 13 15 L 10 22" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="32" y="18" fill="#1E293B" fontSize="9" fontWeight="900" fontFamily="sans-serif">神速外送</text>
        </g>

        {/* Truck Front Cabin */}
        <path
          d="M 114 36 L 134 36 L 152 48 L 166 50 C 169 51 171 54 171 57 L 171 66 L 114 66 Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="2.5"
        />

        {/* Windshield */}
        <polygon points="135,38 149,48 135,48" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
        <polygon points="151,48 164,50 164,56 151,56" fill="#BAE6FD" opacity="0.9" />

        {/* Bumper & Headlight */}
        <rect x="168" y="58" width="5" height="7" rx="1" fill="#E2E8F0" />
        <polygon points="171,53 220,44 220,72 171,62" fill="url(#yellowBeam)" opacity="0.4" />
        <circle cx="169" cy="56" r="3.5" fill="#FEF08A" />

        {/* Rear Wheel */}
        <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '42px 66px' }}>
          <circle cx="42" cy="66" r="15" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
          <circle cx="42" cy="66" r="6" fill="#94A3B8" />
          <line x1="42" y1="51" x2="42" y2="81" stroke="#F1F5F9" strokeWidth="2" />
          <line x1="27" y1="66" x2="57" y2="66" stroke="#F1F5F9" strokeWidth="2" />
        </g>

        {/* Front Wheel */}
        <g style={{ animation: `spin ${wheelSpinSpeed}s linear infinite`, transformOrigin: '142px 66px' }}>
          <circle cx="142" cy="66" r="15" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
          <circle cx="142" cy="66" r="6" fill="#94A3B8" />
          <line x1="142" y1="51" x2="142" y2="81" stroke="#F1F5F9" strokeWidth="2" />
          <line x1="127" y1="66" x2="157" y2="66" stroke="#F1F5F9" strokeWidth="2" />
        </g>

        <defs>
          <linearGradient id="yellowBeam" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

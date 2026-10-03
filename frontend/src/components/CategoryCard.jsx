import React from 'react';
import { useStore } from '../context/StoreContext';

/**
 * Isolated Category Product Illustration Renderer
 * Creates crisp, clean isolated product graphics without messy photo backgrounds,
 * perfectly matching the quick-commerce aesthetic from reference Image 2.
 */
const CategoryGraphic = ({ slug, name, category, image }) => {
  const categoryImage = category?.image || image;
  switch (slug) {
    case 'cement':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cementBag" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="cementBand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#08274C" />
              <stop offset="100%" stopColor="#0F3A6E" />
            </linearGradient>
            <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.15" />
            </filter>
          </defs>
          {/* Cement Bag */}
          <g filter="url(#dropShadow)">
            <rect x="22" y="16" width="56" height="66" rx="8" fill="url(#cementBag)" />
            {/* Top stitch fold */}
            <path d="M 22 22 Q 50 25 78 22" stroke="#B45309" strokeWidth="2.5" strokeDasharray="3 2" />
            {/* Navy Center Banner */}
            <rect x="22" y="32" width="56" height="26" fill="url(#cementBand)" />
            <text x="50" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">CEMENT</text>
            <text x="50" y="53" textAnchor="middle" fill="#FDE68A" fontSize="6.5" fontWeight="800" fontFamily="sans-serif">OPC 53 GRADE</text>
            {/* Bottom 50kg mark */}
            <rect x="36" y="66" width="28" height="10" rx="3" fill="#FFFFFF" />
            <text x="50" y="73.5" textAnchor="middle" fill="#08274C" fontSize="6" fontWeight="900" fontFamily="sans-serif">50 KG</text>
          </g>
          {/* Steel Trowel in front */}
          <g transform="translate(48, 52) rotate(-22)" filter="url(#dropShadow)">
            <polygon points="12,0 30,12 12,24" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
            <path d="M 8 12 L 0 12" stroke="#475569" strokeWidth="2.5" />
            <rect x="-8" y="9.5" width="10" height="5" rx="2" fill="#D97706" />
          </g>
        </svg>
      );

    case 'tiling':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tileGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="tile2Grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <filter id="tileShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.12" />
            </filter>
          </defs>
          {/* Back Tile */}
          <g filter="url(#tileShadow)" transform="translate(18, 14) rotate(-8)">
            <rect x="0" y="0" width="52" height="52" rx="4" fill="url(#tile2Grad)" stroke="#64748B" strokeWidth="1.5" />
            <path d="M 6 12 Q 26 22 46 16 M 12 40 Q 30 32 44 42" stroke="#E2E8F0" strokeWidth="1" opacity="0.6" />
          </g>
          {/* Front Glossy Vitrified Tile */}
          <g filter="url(#tileShadow)" transform="translate(30, 26)">
            <rect x="0" y="0" width="52" height="52" rx="4" fill="url(#tileGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Marble Vein Texture */}
            <path d="M 4 8 Q 24 28 48 20 M 10 42 Q 32 30 46 44" stroke="#94A3B8" strokeWidth="1.2" opacity="0.4" />
            <rect x="4" y="4" width="44" height="44" rx="2" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
          </g>
          {/* Tile Spacer Plus Marks */}
          <g transform="translate(14, 62)" fill="#EA580C">
            <rect x="6" y="0" width="4" height="16" rx="1" />
            <rect x="0" y="6" width="16" height="4" rx="1" />
          </g>
        </svg>
      );

    case 'painting':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="paintBucket" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="paintColor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <filter id="paintShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Paint Bucket */}
          <g filter="url(#paintShadow)">
            <ellipse cx="44" cy="30" rx="26" ry="7" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M 18 30 L 22 74 Q 44 80 66 74 L 70 30" fill="url(#paintBucket)" stroke="#94A3B8" strokeWidth="1.5" />
            {/* Color Paint Top Rim */}
            <ellipse cx="44" cy="30" rx="23" ry="5.5" fill="url(#paintColor)" />
            {/* Paint Drips */}
            <path d="M 32 32 C 32 40 37 42 37 46 C 37 49 34 50 34 50 C 34 46 30 44 30 32 Z" fill="url(#paintColor)" />
            <path d="M 52 32 C 52 42 58 44 58 52 C 58 56 54 57 54 57 C 54 50 50 46 50 32 Z" fill="url(#paintColor)" />
            {/* Bucket Handle */}
            <path d="M 18 34 C 14 18 74 18 70 34" stroke="#64748B" strokeWidth="2.5" fill="none" />
          </g>
          {/* Paint Roller Tool */}
          <g transform="translate(46, 38) rotate(18)" filter="url(#paintShadow)">
            <rect x="8" y="0" width="30" height="14" rx="4" fill="#F15A24" />
            <path d="M 23 14 L 23 28 L 18 32 L 18 42" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="15" y="38" width="6" height="14" rx="2" fill="#08274C" />
          </g>
        </svg>
      );

    case 'waterproofing':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wpBucket" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0B4E8C" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="wpShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Drum Container */}
          <g filter="url(#wpShadow)">
            <ellipse cx="45" cy="28" rx="26" ry="7" fill="#0369A1" />
            <path d="M 19 28 L 22 74 Q 45 80 68 74 L 71 28" fill="url(#wpBucket)" />
            <ellipse cx="45" cy="28" rx="23" ry="5.5" fill="#38BDF8" />
            {/* Label */}
            <rect x="23" y="40" width="44" height="22" rx="3" fill="#FFFFFF" />
            <text x="45" y="50" textAnchor="middle" fill="#0B4E8C" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">DR. FIXIT</text>
            <text x="45" y="58" textAnchor="middle" fill="#059669" fontSize="5.5" fontWeight="800" fontFamily="sans-serif">WATERPROOF</text>
          </g>
          {/* Water Shield Badge & Drops */}
          <g transform="translate(56, 44)" filter="url(#wpShadow)">
            <path d="M 14 0 L 28 5 C 28 16 22 24 14 28 C 6 24 0 16 0 5 Z" fill="url(#shieldGrad)" />
            <path d="M 8 13 L 12 17 L 20 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );

    case 'wires-mcb-distribution':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redWire" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
            <linearGradient id="blueWire" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="yellowWire" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id="wireShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Coiled Wire Rings */}
          <g filter="url(#wireShadow)">
            {/* Blue Coil (Back) */}
            <ellipse cx="44" cy="42" rx="34" ry="22" stroke="url(#blueWire)" strokeWidth="7" fill="none" />
            {/* Yellow Coil (Middle) */}
            <ellipse cx="44" cy="48" rx="32" ry="20" stroke="url(#yellowWire)" strokeWidth="7" fill="none" />
            {/* Red Coil (Front) */}
            <ellipse cx="44" cy="54" rx="30" ry="18" stroke="url(#redWire)" strokeWidth="7" fill="none" />
            {/* Cable Tie Band */}
            <rect x="36" y="32" width="16" height="30" rx="3" fill="#08274C" />
            <text x="44" y="49" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="900" fontFamily="sans-serif">HAVELLS</text>
          </g>
          {/* MCB Switch Breaker */}
          <g transform="translate(56, 20)" filter="url(#wireShadow)">
            <rect x="0" y="0" width="26" height="42" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="4" y="6" width="18" height="12" rx="2" fill="#EF4444" />
            <rect x="6" y="24" width="14" height="4" rx="1" fill="#08274C" />
            <circle cx="13" cy="34" r="2.5" fill="#10B981" />
          </g>
        </svg>
      );

    case 'plywood-mdf-hdhmr':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="plywoodWood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DEB887" />
              <stop offset="100%" stopColor="#C19A6B" />
            </linearGradient>
            <linearGradient id="hdhmrGreen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <filter id="woodShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Plywood Stacked Boards */}
          <g filter="url(#woodShadow)">
            {/* Sheet 1 (Bottom Wood Layer) */}
            <polygon points="12,50 62,30 88,44 38,64" fill="#8B5A2B" />
            <polygon points="12,50 38,64 38,70 12,56" fill="#654321" />
            <polygon points="38,64 88,44 88,50 38,70" fill="#5C3818" />

            {/* Sheet 2 (Middle Marine Plywood) */}
            <polygon points="12,42 62,22 88,36 38,56" fill="url(#plywoodWood)" />
            <polygon points="12,42 38,56 38,48 12,34" fill="#A07248" />
            <polygon points="38,56 88,36 88,42 38,62" fill="#8B5A2B" />
            {/* Wood Grain Lines */}
            <path d="M 24 44 Q 50 34 76 30 M 20 48 Q 54 36 78 40" stroke="#8B5A2B" strokeWidth="1" opacity="0.4" />

            {/* Sheet 3 (Top Action TESA HDHMR Block) */}
            <polygon points="18,32 58,16 80,28 40,44" fill="url(#hdhmrGreen)" />
            <polygon points="18,32 40,44 40,50 18,38" fill="#064E3B" />
            <polygon points="40,44 80,28 80,34 40,50" fill="#022C22" />
            <text x="48" y="32" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" transform="rotate(-14 48 32)">TESA HDHMR</text>
          </g>
        </svg>
      );

    case 'fevicol':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fevicolYellow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            <linearGradient id="fevicolBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <filter id="fevicolShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Main Fevicol Tub */}
          <g filter="url(#fevicolShadow)">
            {/* Blue Lid */}
            <ellipse cx="42" cy="24" rx="22" ry="6" fill="url(#fevicolBlue)" stroke="#172554" strokeWidth="1" />
            <path d="M 20 24 L 20 28 Q 42 34 64 28 L 64 24" fill="url(#fevicolBlue)" />
            {/* Yellow Body */}
            <path d="M 20 28 L 23 74 Q 42 80 61 74 L 64 28" fill="url(#fevicolYellow)" stroke="#CA8A04" strokeWidth="1" />
            <ellipse cx="42" cy="74" rx="19" ry="5" fill="#CA8A04" opacity="0.3" />
            {/* Blue Label Band */}
            <path d="M 21.5 42 L 22.5 58 Q 42 63 61.5 58 L 62.5 42 Q 42 47 21.5 42 Z" fill="url(#fevicolBlue)" />
            <text x="42" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900" fontFamily="sans-serif">FEVICOL</text>
            <text x="42" y="57" textAnchor="middle" fill="#FACC15" fontSize="5" fontWeight="800" fontFamily="sans-serif">SH SYNTHETIC</text>
          </g>
          {/* Squeeze Tube Nozzle alongside */}
          <g transform="translate(62, 34) rotate(16)" filter="url(#fevicolShadow)">
            <rect x="0" y="8" width="16" height="34" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <polygon points="4,8 8,0 12,8" fill="#EAB308" />
            <rect x="2" y="16" width="12" height="14" fill="url(#fevicolBlue)" />
            <text x="8" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="3.5" fontWeight="900" fontFamily="sans-serif">SH</text>
          </g>
        </svg>
      );

    case 'switches-sockets':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
            <filter id="switchShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Modular Plate */}
          <g filter="url(#switchShadow)">
            <rect x="15" y="24" width="70" height="52" rx="8" fill="url(#plateGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Inner Chamfer Bezel */}
            <rect x="19" y="28" width="62" height="44" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

            {/* Switch 1 (Rocker) */}
            <rect x="25" y="34" width="14" height="32" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="25" y1="50" x2="39" y2="50" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="32" cy="42" r="1.5" fill="#EF4444" />

            {/* Switch 2 (Rocker) */}
            <rect x="43" y="34" width="14" height="32" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="43" y1="50" x2="57" y2="50" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="50" cy="42" r="1.5" fill="#10B981" />

            {/* 3-Pin Socket */}
            <rect x="61" y="34" width="16" height="32" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <circle cx="69" cy="43" r="2.5" fill="#08274C" />
            <circle cx="65.5" cy="53" r="2" fill="#08274C" />
            <circle cx="72.5" cy="53" r="2" fill="#08274C" />
          </g>
        </svg>
      );

    case 'hinges-channels-handles':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="metalChrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#CBD5E1" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <filter id="metalShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Hydraulic Soft-Close Hinge */}
          <g filter="url(#metalShadow)" transform="translate(14, 18) rotate(12)">
            {/* Cup */}
            <circle cx="16" cy="16" r="14" fill="url(#metalChrome)" stroke="#64748B" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="10" fill="#94A3B8" />
            {/* Arm */}
            <rect x="16" y="9" width="48" height="14" rx="3" fill="url(#metalChrome)" stroke="#64748B" strokeWidth="1.2" />
            {/* Mounting Plate Holes */}
            <rect x="42" y="4" width="18" height="24" rx="2" fill="url(#metalChrome)" stroke="#64748B" strokeWidth="1" />
            <circle cx="46" cy="8" r="2" fill="#475569" />
            <circle cx="56" cy="8" r="2" fill="#475569" />
            <circle cx="46" cy="24" r="2" fill="#475569" />
            <circle cx="56" cy="24" r="2" fill="#475569" />
            {/* Piston damper cylinder */}
            <rect x="22" y="12" width="16" height="8" rx="2" fill="#F59E0B" />
          </g>
          {/* Telescopic Slide Channel in front */}
          <g filter="url(#metalShadow)" transform="translate(16, 58) rotate(-14)">
            <rect x="0" y="0" width="68" height="12" rx="2" fill="url(#metalChrome)" stroke="#64748B" strokeWidth="1.2" />
            <rect x="12" y="3" width="48" height="6" rx="1" fill="#475569" />
            {/* Ball bearings */}
            <circle cx="20" cy="6" r="1.5" fill="#FFFFFF" />
            <circle cx="32" cy="6" r="1.5" fill="#FFFFFF" />
            <circle cx="44" cy="6" r="1.5" fill="#FFFFFF" />
            <circle cx="56" cy="6" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case 'kitchen-systems-accessories':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wireChrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <filter id="kitchenShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* 3D Wire Pullout Basket */}
          <g filter="url(#kitchenShadow)">
            {/* Top Rim Wire */}
            <polygon points="14,34 50,18 86,30 50,46" fill="none" stroke="url(#wireChrome)" strokeWidth="3" strokeLinejoin="round" />
            {/* Bottom Rim Wire */}
            <polygon points="18,60 50,48 82,56 50,68" fill="none" stroke="url(#wireChrome)" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Vertical Wire Pillars */}
            <line x1="14" y1="34" x2="18" y2="60" stroke="url(#wireChrome)" strokeWidth="2.5" />
            <line x1="50" y1="46" x2="50" y2="68" stroke="url(#wireChrome)" strokeWidth="2.5" />
            <line x1="86" y1="30" x2="82" y2="56" stroke="url(#wireChrome)" strokeWidth="2.5" />
            <line x1="32" y1="40" x2="34" y2="64" stroke="url(#wireChrome)" strokeWidth="1.8" />
            <line x1="68" y1="38" x2="66" y2="62" stroke="url(#wireChrome)" strokeWidth="1.8" />
            {/* Inside Plate Rack Dividers */}
            <ellipse cx="44" cy="40" rx="10" ry="16" fill="none" stroke="#F59E0B" strokeWidth="2" transform="rotate(25 44 40)" />
            <ellipse cx="56" cy="36" rx="10" ry="16" fill="none" stroke="#F15A24" strokeWidth="2" transform="rotate(25 56 36)" />
          </g>
        </svg>
      );

    case 'wardrobe-bed-fittings':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pistonBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="pistonRod" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="pumpShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Bed Hydraulic Lift Pump Cylinder */}
          <g filter="url(#pumpShadow)" transform="translate(18, 16) rotate(32)">
            {/* Chrome Piston Rod */}
            <rect x="10" y="4" width="6" height="36" rx="2" fill="url(#pistonRod)" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="13" cy="4" r="4" fill="url(#pistonRod)" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="13" cy="4" r="1.5" fill="#475569" />
            {/* Dark Gas Cylinder Body */}
            <rect x="7" y="32" width="12" height="46" rx="3" fill="url(#pistonBody)" stroke="#334155" strokeWidth="1" />
            <text x="13" y="58" textAnchor="middle" fill="#FDE68A" fontSize="3.5" fontWeight="900" fontFamily="sans-serif" transform="rotate(90 13 58)">150 KG PUMP</text>
            <circle cx="13" cy="78" r="4" fill="url(#pistonBody)" stroke="#334155" strokeWidth="1.5" />
            <circle cx="13" cy="78" r="1.5" fill="#94A3B8" />
          </g>
          {/* Wardrobe Sliding Roller Wheel */}
          <g filter="url(#pumpShadow)" transform="translate(14, 52)">
            <rect x="0" y="8" width="32" height="24" rx="4" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
            <circle cx="16" cy="20" r="10" fill="#F15A24" stroke="#C2410C" strokeWidth="1.5" />
            <circle cx="16" cy="20" r="4" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case 'door-locks-hardware':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brassGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            <filter id="lockShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#08274C" floodOpacity="0.14" />
            </filter>
          </defs>
          {/* Mortise Handle Backplate */}
          <g filter="url(#lockShadow)" transform="translate(24, 14)">
            <rect x="0" y="0" width="22" height="72" rx="6" fill="url(#brassGold)" stroke="#A16207" strokeWidth="1.5" />
            {/* Screw holes */}
            <circle cx="11" cy="6" r="1.5" fill="#78350F" />
            <circle cx="11" cy="66" r="1.5" fill="#78350F" />

            {/* Handle Lever */}
            <circle cx="11" cy="24" r="6" fill="url(#brassGold)" stroke="#A16207" strokeWidth="1" />
            <rect x="11" y="20" width="46" height="8" rx="4" fill="url(#brassGold)" stroke="#A16207" strokeWidth="1.5" />

            {/* Keyhole Cylinder */}
            <rect x="7" y="44" width="8" height="12" rx="4" fill="#78350F" />
            <circle cx="11" cy="48" r="2" fill="#08274C" />
            <polygon points="10,48 12,48 11.5,54 10.5,54" fill="#08274C" />
          </g>
          {/* Brass Key */}
          <g filter="url(#lockShadow)" transform="translate(56, 50) rotate(-35)">
            <circle cx="8" cy="8" r="7" fill="url(#brassGold)" stroke="#A16207" strokeWidth="1.2" />
            <circle cx="8" cy="8" r="3" fill="#EAF4FA" />
            <rect x="15" y="6" width="22" height="4" fill="url(#brassGold)" stroke="#A16207" strokeWidth="1.2" />
            <rect x="29" y="10" width="3" height="4" fill="url(#brassGold)" />
            <rect x="34" y="10" width="3" height="6" fill="url(#brassGold)" />
          </g>
        </svg>
      );

    default:
      return (
        <img
          src={categoryImage || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300'}
          alt={name || 'Category'}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300';
          }}
        />
      );
  }
};

/**
 * Quick Commerce Category Tile Component
 * - Crisp light blue squircle background (#EAF4FA)
 * - Isolated, drop-shadowed 3D product bundle illustration
 * - Bold dark title below the tile
 */
export const CategoryCard = ({ category }) => {
  const { navigateTo } = useStore();

  return (
    <div
      onClick={() => navigateTo('category-products', { slug: category.slug, categoryName: category.name })}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="qc-category-item"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        const box = e.currentTarget.querySelector('.qc-tile-box');
        if (box) {
          box.style.backgroundColor = 'var(--qc-category-hover, #FFEFC2)';
          box.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.1)';
          box.style.borderColor = '#FFD84D';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        const box = e.currentTarget.querySelector('.qc-tile-box');
        if (box) {
          box.style.backgroundColor = 'var(--qc-category-bg, #FFF8E1)';
          box.style.boxShadow = 'none';
          box.style.borderColor = 'var(--qc-category-border, #FFE08A)';
        }
      }}
    >
      {/* Light Blue Squircle Tile Container */}
      <div
        className="qc-tile-box"
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          maxWidth: '110px',
          backgroundColor: 'var(--qc-category-bg, #FFF8E1)',
          borderRadius: '18px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          border: '1px solid var(--qc-category-border, #FFE08A)',
        }}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CategoryGraphic slug={category.slug} name={category.name} category={category} image={category.image} />
        </div>
      </div>

      {/* Category Name Below Tile */}
      <div
        style={{
          marginTop: '6px',
          textAlign: 'center',
          width: '100%',
          padding: '0 2px',
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: '700',
            color: '#1E293B',
            lineHeight: '1.2',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {category.name}
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;


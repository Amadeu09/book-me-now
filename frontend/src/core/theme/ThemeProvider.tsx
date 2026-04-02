import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser } from '@/utils/session';

export type AppTheme = {
  primary: string;           
  primaryLight: string;      
  background: string;        
  textOnPrimary: string;     

  sidebarBg: string;
  sidebarText: string;
  sidebarTextInactive: string;
  sidebarActiveBg: string;
  sidebarActiveBorder: string;

  headerBg: string;
  headerText: string;
  headerSubtitle: string;

  setPrimaryColor: (hex: string) => void;
};

const DEFAULT_PRIMARY = '#FF6A00';

// Default mock values to avoid null checks
const defaultTheme: AppTheme = {
  primary: DEFAULT_PRIMARY,
  primaryLight: '#ffffff',
  background: '#f8f9fa',
  textOnPrimary: '#ffffff',
  sidebarBg: '#ffffff',
  sidebarText: '#0f172a',
  sidebarTextInactive: '#6b7280',
  sidebarActiveBg: 'rgba(226, 232, 240, 0.8)',
  sidebarActiveBorder: 'rgba(148, 163, 184, 0.6)',
  headerBg: '#ffffff',
  headerText: '#0f172a',
  headerSubtitle: '#6b7280',
  setPrimaryColor: () => {},
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

function hexToRgb(hex: string) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function lightenColor(hex: string, percent: number) {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.round(r + (255 - r) * percent);
  const newG = Math.round(g + (255 - g) * percent);
  const newB = Math.round(b + (255 - b) * percent);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

function getContrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function computeTheme(primaryHex: string, setPrimaryColor: (hex: string) => void): AppTheme {
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i;
  const validHex = hexPattern.test(primaryHex) ? primaryHex : DEFAULT_PRIMARY;

  const isWhite = validHex.toLowerCase() === '#ffffff';
  
  // If the user selects white, we revert the general accent color to classic orange
  // so that buttons don't become invisible white.
  const accentColor = isWhite ? DEFAULT_PRIMARY : validHex;
  const contrastText = getContrastText(accentColor);

  return {
    primary: accentColor,
    primaryLight: isWhite ? '#ffffff' : lightenColor(accentColor, 0.95),
    background: isWhite ? '#f8f9fa' : lightenColor(accentColor, 0.98),
    textOnPrimary: contrastText,
    
    // UI Elements
    sidebarBg: isWhite ? '#ffffff' : accentColor,
    sidebarText: isWhite ? '#0f172a' : contrastText,
    sidebarTextInactive: isWhite ? '#6b7280' : contrastText + 'b3',
    sidebarActiveBg: isWhite ? 'rgba(226, 232, 240, 0.8)' : contrastText + '22',
    sidebarActiveBorder: isWhite ? 'rgba(148, 163, 184, 0.6)' : contrastText + '44',

    headerBg: isWhite ? '#ffffff' : accentColor,
    headerText: isWhite ? '#0f172a' : contrastText,
    headerSubtitle: isWhite ? '#6b7280' : contrastText + 'cc',

    setPrimaryColor
  };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(defaultTheme);

  // Expose this so any component can dynamically change the color
  const updateThemeColor = (hex: string) => {
    setTheme(computeTheme(hex, updateThemeColor));
  };

  useEffect(() => {
    // Determine the user's company primary color on mount
    getUser().then(user => {
      const companyColor = user?.empresa?.colorPrimari;
      if (companyColor) {
        setTheme(computeTheme(companyColor, updateThemeColor));
      } else {
        setTheme(computeTheme(DEFAULT_PRIMARY, updateThemeColor));
      }
    });
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}

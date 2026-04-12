import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser } from '@/utils/session';

export type AppTheme = {
  primary: string;
  primaryMid: string;
  primaryLight: string;
  background: string;
  textOnPrimary: string;

  /** True when no custom company color has been set. Soft and dark cards render as neutral/white. */
  isDefault: boolean;

  sidebarBg: string;
  sidebarText: string;
  sidebarTextInactive: string;
  sidebarActiveBg: string;
  sidebarActiveBorder: string;

  headerBg: string;
  headerText: string;
  headerSubtitle: string;

  /** Border for soft cards (primaryLight bg). 0 when company color is white or default. */
  softBorderWidth: number;
  softBorderColor: string;

  setPrimaryColor: (hex: string) => void;
};

const DEFAULT_PRIMARY = '#FF6A00';

// Default theme — used when the company has NOT set a custom color.
// Cards are neutral/white; primary is still orange for buttons/navbar.
const defaultTheme: AppTheme = {
  primary: DEFAULT_PRIMARY,
  primaryMid: '#e2e8f0',
  primaryLight: '#ffffff',
  background: '#f8f9fa',
  textOnPrimary: '#ffffff',
  isDefault: true,
  sidebarBg: '#ffffff',
  sidebarText: '#0f172a',
  sidebarTextInactive: '#6b7280',
  sidebarActiveBg: 'rgba(226, 232, 240, 0.8)',
  sidebarActiveBorder: 'rgba(148, 163, 184, 0.6)',
  headerBg: '#ffffff',
  headerText: '#0f172a',
  headerSubtitle: '#6b7280',
  softBorderWidth: 0,
  softBorderColor: 'transparent',
  setPrimaryColor: () => { },
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
    primaryMid: isWhite ? '#e2e8f0' : lightenColor(accentColor, 0.60),
    primaryLight: isWhite ? '#ffffff' : lightenColor(accentColor, 0.85),
    background: isWhite ? '#f8f9fa' : lightenColor(accentColor, 0.93),
    textOnPrimary: contrastText,
    isDefault: false,

    // UI Elements
    sidebarBg: isWhite ? '#ffffff' : accentColor,
    sidebarText: isWhite ? '#0f172a' : contrastText,
    sidebarTextInactive: isWhite ? '#6b7280' : contrastText + 'b3',
    sidebarActiveBg: isWhite ? 'rgba(226, 232, 240, 0.8)' : contrastText + '22',
    sidebarActiveBorder: isWhite ? 'rgba(148, 163, 184, 0.6)' : contrastText + '44',

    headerBg: isWhite ? '#ffffff' : accentColor,
    headerText: isWhite ? '#0f172a' : contrastText,
    headerSubtitle: isWhite ? '#6b7280' : contrastText + 'cc',

    softBorderWidth: 0,
    softBorderColor: 'transparent',

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
        // No custom color — use neutral default (white cards, no tints)
        setTheme({ ...defaultTheme, setPrimaryColor: updateThemeColor });
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

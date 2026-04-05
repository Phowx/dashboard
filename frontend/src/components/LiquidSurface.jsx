import React from 'react';
import LiquidGlass from 'liquid-glass-react';

const PRESETS = {
  toolbarBrand: {
    cornerRadius: 999,
    padding: '0px',
    style: { width: 'fit-content' },
    mode: 'prominent',
    displacementScale: { dark: 42, light: 28 },
    blurAmount: { dark: 0.09, light: 0.16 },
    saturation: { dark: 128, light: 158 },
    aberrationIntensity: { dark: 1.2, light: 1.5 },
    elasticity: 0.28,
  },
  toolbarPill: {
    cornerRadius: 999,
    padding: '0px',
    style: { width: 'fit-content' },
    mode: 'prominent',
    displacementScale: { dark: 36, light: 24 },
    blurAmount: { dark: 0.08, light: 0.14 },
    saturation: { dark: 126, light: 154 },
    aberrationIntensity: { dark: 1.1, light: 1.4 },
    elasticity: 0.24,
  },
  toolbarIcon: {
    cornerRadius: 999,
    padding: '0px',
    style: { width: 'fit-content' },
    mode: 'prominent',
    displacementScale: { dark: 34, light: 22 },
    blurAmount: { dark: 0.08, light: 0.13 },
    saturation: { dark: 126, light: 152 },
    aberrationIntensity: { dark: 1, light: 1.3 },
    elasticity: 0.24,
  },
  launchpadPanel: {
    cornerRadius: 24,
    padding: '0px',
    style: { width: '100%' },
    mode: 'standard',
    displacementScale: { dark: 26, light: 18 },
    blurAmount: { dark: 0.07, light: 0.12 },
    saturation: { dark: 124, light: 150 },
    aberrationIntensity: { dark: 0.8, light: 1.1 },
    elasticity: 0.2,
  },
  shortcutCard: {
    cornerRadius: 22,
    padding: '0px',
    style: { width: '100%' },
    mode: 'standard',
    displacementScale: { dark: 24, light: 16 },
    blurAmount: { dark: 0.06, light: 0.11 },
    saturation: { dark: 122, light: 148 },
    aberrationIntensity: { dark: 0.75, light: 1 },
    elasticity: 0.18,
  },
  addButton: {
    cornerRadius: 999,
    padding: '0px',
    style: { width: 'fit-content' },
    mode: 'prominent',
    displacementScale: { dark: 30, light: 20 },
    blurAmount: { dark: 0.08, light: 0.13 },
    saturation: { dark: 126, light: 152 },
    aberrationIntensity: { dark: 0.95, light: 1.2 },
    elasticity: 0.22,
  },
  modal: {
    cornerRadius: 28,
    padding: '0px',
    style: { width: '100%' },
    mode: 'prominent',
    displacementScale: { dark: 30, light: 22 },
    blurAmount: { dark: 0.1, light: 0.16 },
    saturation: { dark: 132, light: 160 },
    aberrationIntensity: { dark: 0.9, light: 1.25 },
    elasticity: 0.18,
  },
  closeButton: {
    cornerRadius: 999,
    padding: '0px',
    style: { width: 'fit-content' },
    mode: 'prominent',
    displacementScale: { dark: 28, light: 18 },
    blurAmount: { dark: 0.08, light: 0.13 },
    saturation: { dark: 128, light: 154 },
    aberrationIntensity: { dark: 0.9, light: 1.15 },
    elasticity: 0.2,
  },
};

function resolveThemeValue(value, isLightTheme) {
  if (value && typeof value === 'object') {
    return isLightTheme ? value.light ?? value.dark : value.dark ?? value.light;
  }

  return value;
}

export default function LiquidSurface({
  children,
  variant = 'launchpadPanel',
  className = '',
  contentClassName = '',
  style = {},
  overLight,
  ...overrides
}) {
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
  const preset = PRESETS[variant] || PRESETS.launchpadPanel;

  const rootClassName = ['liquid-surface', `liquid-surface-${variant}`, className].filter(Boolean).join(' ');
  const innerClassName = ['liquid-surface-content', `liquid-surface-content-${variant}`, contentClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <LiquidGlass
      className={rootClassName}
      style={{ ...resolveThemeValue(preset.style, isLightTheme), ...style }}
      padding={resolveThemeValue(preset.padding, isLightTheme)}
      cornerRadius={resolveThemeValue(preset.cornerRadius, isLightTheme)}
      mode={resolveThemeValue(preset.mode, isLightTheme)}
      displacementScale={resolveThemeValue(preset.displacementScale, isLightTheme)}
      blurAmount={resolveThemeValue(preset.blurAmount, isLightTheme)}
      saturation={resolveThemeValue(preset.saturation, isLightTheme)}
      aberrationIntensity={resolveThemeValue(preset.aberrationIntensity, isLightTheme)}
      elasticity={resolveThemeValue(preset.elasticity, isLightTheme)}
      overLight={overLight ?? isLightTheme}
      {...overrides}
    >
      <div className={innerClassName}>{children}</div>
    </LiquidGlass>
  );
}

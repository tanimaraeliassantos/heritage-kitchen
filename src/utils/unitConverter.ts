export type UnitSystem = 'metric' | 'imperial';

interface ConversionMap {
  [key: string]: {
    to: string;
    factor: number;
  };
}

const metricToImperial: ConversionMap = {
  kg: { to: 'lbs', factor: 2.20462 },
  g: { to: 'oz', factor: 0.035274 },
  ml: { to: 'fl oz', factor: 0.033814 },
  l: { to: 'qt', factor: 1.05669 },
  cm: { to: 'in', factor: 0.393701 },
  mm: { to: 'in', factor: 0.0393701 },
  '°C': { to: '°F', factor: 1 }, // special handling
};

const imperialToMetric: ConversionMap = {
  lbs: { to: 'kg', factor: 0.453592 },
  oz: { to: 'g', factor: 28.3495 },
  'fl oz': { to: 'ml', factor: 29.5735 },
  qt: { to: 'l', factor: 0.946353 },
  in: { to: 'cm', factor: 2.54 },
  '°F': { to: '°C', factor: 1 }, // special handling
};

export function convertUnit(
  value: number,
  fromUnit: string,
  targetSystem: UnitSystem
): { value: number; unit: string } {
  const normalizedUnit = fromUnit.toLowerCase().trim();

  // Temperature special case
  if (normalizedUnit === '°c' && targetSystem === 'imperial') {
    return { value: Math.round((value * 9) / 5 + 32), unit: '°F' };
  }
  if (normalizedUnit === '°f' && targetSystem === 'metric') {
    return { value: Math.round(((value - 32) * 5) / 9), unit: '°C' };
  }

  const map = targetSystem === 'imperial' ? metricToImperial : imperialToMetric;
  const conversion = map[normalizedUnit] || map[fromUnit];

  if (!conversion) {
    return { value, unit: fromUnit };
  }

  return {
    value: Math.round(value * conversion.factor * 100) / 100,
    unit: conversion.to,
  };
}

export function parseIngredientAmount(text: string): {
  amount: number | null;
  unit: string | null;
  ingredient: string;
} {
  const match = text.match(/^([\d./]+)\s*(kg|g|ml|l|cm|mm|lbs|oz|fl oz|qt|in|cup|cups|tbsp|tsp)?\s*(.+)/i);
  if (match) {
    let amount = 0;
    if (match[1].includes('/')) {
      const [num, den] = match[1].split('/');
      amount = parseInt(num) / parseInt(den);
    } else {
      amount = parseFloat(match[1]);
    }
    return {
      amount,
      unit: match[2] || null,
      ingredient: match[3].trim(),
    };
  }
  return { amount: null, unit: null, ingredient: text };
}

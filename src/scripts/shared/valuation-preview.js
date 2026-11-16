import { CLASSES, UF } from './valuation-data.js';

export const normalizeCity = value => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

// This demonstration deliberately has no fallback market rate for unknown locations.
export function calculatePreview(state, city, areas) {
  if (areas.length !== CLASSES.length) throw new RangeError('Informe uma área para cada classe de uso.');
  const hectares = areas.map(value => Number(value || 0));
  if (hectares.some(value => !Number.isFinite(value) || value < 0 || value > 10000000)) {
    throw new RangeError('Informe áreas válidas em hectares.');
  }
  const totalArea = hectares.reduce((total, value) => total + value, 0);
  const reference = UF[state]?.c.find(([name]) => normalizeCity(name) === normalizeCity(city));
  const value = reference && totalArea > 0
    ? Math.round(hectares.reduce((total, area, index) => total + area * CLASSES[index].v * reference[1], 0))
    : null;
  return {
    totalArea,
    uses: hectares.filter(area => area > 0).length,
    value,
    minimum: value === null ? null : Math.round(value * 0.81),
    maximum: value === null ? null : Math.round(value * 1.16),
    pole: reference?.[2] || null,
  };
}

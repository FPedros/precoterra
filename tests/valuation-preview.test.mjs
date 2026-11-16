import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePreview } from '../src/scripts/shared/valuation-preview.js';

test('combina áreas por uso do solo e mantém as unidades em hectares', () => {
  const preview = calculatePreview('MT', 'Sorriso', [100, 0, 0, 50, 0, 0, 0, 0]);
  assert.equal(preview.totalArea, 150);
  assert.equal(preview.uses, 2);
  assert.equal(preview.value, 2020000);
  assert.equal(preview.minimum, 1636200);
  assert.equal(preview.maximum, 2343200);
});

test('usa a referência do município e aceita nomes sem acentos', () => {
  const preview = calculatePreview('GO', '  cristALIna  ', [10.5, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(preview.value, 181913);
  assert.equal(preview.pole, 'Polo 24 — Sudeste de GO');
  const accented = calculatePreview('MT', 'Rondonopolis', [1, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(accented.pole, 'Polo 14 — Sul de MT');
});

test('não inventa um valor para municípios ou estados fora da base demonstrativa', () => {
  for (const [state, city] of [['SC', 'Florianópolis'], ['MT', 'Cuiabá'], ['XX', 'Sorriso']]) {
    const preview = calculatePreview(state, city, [100, 0, 0, 0, 0, 0, 0, 0]);
    assert.equal(preview.value, null);
    assert.equal(preview.minimum, null);
    assert.equal(preview.maximum, null);
    assert.equal(preview.totalArea, 100);
  }
});

test('uma área vazia não gera avaliação', () => {
  const preview = calculatePreview('MT', 'Sorriso', Array(8).fill(0));
  assert.equal(preview.value, null);
  assert.equal(preview.totalArea, 0);
  assert.equal(preview.uses, 0);
});

test('rejeita áreas negativas, não numéricas, infinitas ou excessivas', () => {
  for (const invalid of [-1, 'inválido', Infinity, 10000001]) {
    assert.throws(() => calculatePreview('MT', 'Sorriso', [invalid, 0, 0, 0, 0, 0, 0, 0]), RangeError);
  }
  assert.throws(() => calculatePreview('MT', 'Sorriso', [100]), RangeError);
});

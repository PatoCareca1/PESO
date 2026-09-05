import { describe, expect, it } from 'vitest';
import {
  dateLabel,
  decimal,
  digits,
  exerciseCount,
  mmss,
  setCount,
  toNumberOrNull,
} from './format';

describe('mmss', () => {
  it('pads minutes and seconds', () => {
    expect(mmss(0)).toBe('00:00');
    expect(mmss(5_000)).toBe('00:05');
    expect(mmss(65_000)).toBe('01:05');
  });

  it('does not cap minutes at 60 and never goes negative', () => {
    expect(mmss(3_600_000 + 61_000)).toBe('61:01');
    expect(mmss(-500)).toBe('00:00');
  });

  it('floors partial seconds', () => {
    expect(mmss(999)).toBe('00:00');
    expect(mmss(1_999)).toBe('00:01');
  });
});

describe('dateLabel', () => {
  it('formats as "DD de mês."', () => {
    expect(dateLabel('2026-09-04T12:00:00')).toBe('04 de set.');
    expect(dateLabel('2026-01-31T00:00:00')).toBe('31 de jan.');
  });

  it('is empty for garbage', () => {
    expect(dateLabel('nope')).toBe('');
  });
});

describe('plurals', () => {
  it('handles the singular', () => {
    expect(exerciseCount(1)).toBe('1 exercício');
    expect(exerciseCount(0)).toBe('0 exercícios');
    expect(exerciseCount(4)).toBe('4 exercícios');
    expect(setCount(1)).toBe('1 série');
    expect(setCount(12)).toBe('12 séries');
  });
});

describe('digits', () => {
  it('keeps only 0-9', () => {
    expect(digits('12a3.4')).toBe('1234');
    expect(digits('')).toBe('');
  });
});

describe('decimal', () => {
  it('accepts a single separator and normalises the comma', () => {
    expect(decimal('12')).toBe('12');
    expect(decimal('12,5')).toBe('12.5');
    expect(decimal('12.5')).toBe('12.5');
    expect(decimal('.5')).toBe('.5');
    expect(decimal('5.')).toBe('5.');
  });

  it('drops every separator after the first', () => {
    expect(decimal('1,2,3')).toBe('1.23');
    expect(decimal('1.2.3')).toBe('1.23');
    expect(decimal('1.2,3')).toBe('1.23');
  });

  it('strips everything else', () => {
    expect(decimal('80kg')).toBe('80');
    expect(decimal('-5')).toBe('5');
  });

  it('always yields something toNumberOrNull can parse or a lone separator', () => {
    for (const raw of ['1,2,3', '1.2,3', 'a1b2', '..', ',5,', '7,,7']) {
      const masked = decimal(raw);
      const parsed = toNumberOrNull(masked);
      // A bare "." is the only masked value that is not a number, and it
      // reads as "nothing typed" — that is the intended outcome.
      expect(parsed !== null || masked === '.').toBe(true);
    }
  });
});

describe('toNumberOrNull', () => {
  it('maps empty and non-numeric to null', () => {
    expect(toNumberOrNull('')).toBe(null);
    expect(toNumberOrNull('abc')).toBe(null);
    expect(toNumberOrNull('.')).toBe(null);
  });

  it('keeps zero distinct from empty', () => {
    expect(toNumberOrNull('0')).toBe(0);
    expect(toNumberOrNull('12.5')).toBe(12.5);
  });
});

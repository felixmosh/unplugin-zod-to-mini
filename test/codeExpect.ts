import { expect } from 'vitest';

export function normalizeCode(code: unknown): string {
  return String(code ?? '')
    .replace(/'/g, '"')
    .replace(/_/g, '')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\(([A-Za-z_$][\w$]*)\)=>/g, '$1=>')
    .replace(/\s+/g, '');
}

export function expectCode(actual: unknown): {
  toContain(expected: string): void;
  notToContain(expected: string): void;
  toEqual(expected: string): void;
} {
  const normalizedActual = normalizeCode(actual);

  return {
    toContain(expected) {
      expect(normalizedActual).toContain(normalizeCode(expected));
    },
    notToContain(expected) {
      expect(normalizedActual).not.toContain(normalizeCode(expected));
    },
    toEqual(expected) {
      expect(normalizedActual).toBe(normalizeCode(expected));
    },
  };
}

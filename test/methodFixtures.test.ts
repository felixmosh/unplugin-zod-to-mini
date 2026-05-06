import { describe, expect, it } from 'vitest';
import { transformZodToMini } from '../src/lib/transform';
import { expectCode } from './codeExpect';
import { GOLDEN_METHOD_CASES } from './methodSupport';

const transformZodSnippet = (code: string) => transformZodToMini(`import { z } from 'zod';\n${code}`);

describe('method fixtures', () => {
  it.each(GOLDEN_METHOD_CASES)('$title', ({ input, expected }) => {
    const output = transformZodSnippet(input);
    expect(output).toBeDefined();
    expectCode(output).toContain(expected);
  });
});

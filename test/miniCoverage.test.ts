import { describe, expect, it } from 'vitest';
import { z } from 'zod/mini';
import {
  EXCLUDED_MINI_RUNTIME_FUNCTIONS,
  SUPPORTED_PASSTHROUGH_MINI_METHODS,
  TRANSFORMER_SUPPORTED_MINI_METHODS,
  TRANSFORMER_VIRTUAL_MINI_METHODS,
} from './methodSupport';

function getRuntimeCallableMiniExports(): string[] {
  return Object.keys(z)
    .filter((key) => /^[_a-z]/.test(key))
    .filter((key) => typeof z[key as keyof typeof z] === 'function')
    .sort();
}

describe('zod/mini coverage', () => {
  const supportedMethods = new Set([
    ...TRANSFORMER_SUPPORTED_MINI_METHODS,
    ...SUPPORTED_PASSTHROUGH_MINI_METHODS,
  ]);

  it('references existing zod/mini exports for every transformer-emitted mini method', () => {
    const runtimeExports = new Set(Object.keys(z));
    const missing = [...supportedMethods]
      .filter(
        (methodName) =>
          !runtimeExports.has(methodName) && !TRANSFORMER_VIRTUAL_MINI_METHODS.has(methodName),
      )
      .sort();

    expect(missing).toHaveLength(0);
  });

  it('classifies every callable mini export as supported or intentionally excluded', () => {
    const runtimeCallables = getRuntimeCallableMiniExports();
    const unclassified = runtimeCallables.filter((methodName) =>
      (
        !supportedMethods.has(methodName) &&
        !EXCLUDED_MINI_RUNTIME_FUNCTIONS.has(methodName)
      ));

    expect(unclassified).toHaveLength(0);
  });
});

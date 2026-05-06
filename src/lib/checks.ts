import { GENERATED_MINI_CHECK_METHODS } from './generated-zod-metadata';

export const MINI_DYNAMIC_CHECK_METHODS = new Set<string>(GENERATED_MINI_CHECK_METHODS);

export const MINI_CHECK_ALIASES = new Set(['min', 'max', 'step', 'nonempty']);
export const MINI_CUSTOM_CHECK_METHODS = new Set(['refine', 'superRefine', 'meta', 'describe']);
export const MINI_EXTRA_CHAIN_CHECK_METHODS = new Set(['uuid', 'int', 'date', 'iso', 'discriminatedUnion']);

export const SUPPORTED_CHAIN_CHECK_METHODS = new Set<string>([
  ...MINI_DYNAMIC_CHECK_METHODS,
  ...MINI_CHECK_ALIASES,
  ...MINI_CUSTOM_CHECK_METHODS,
  ...MINI_EXTRA_CHAIN_CHECK_METHODS,
]);

export function isSupportedChainCheckMethod(methodName: string): boolean {
  return SUPPORTED_CHAIN_CHECK_METHODS.has(methodName);
}

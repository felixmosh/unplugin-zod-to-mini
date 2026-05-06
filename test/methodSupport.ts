import {
  BASE_METHODS,
  FUNCTIONAL_CHECK_METHODS,
  OBJECT_MODE_METHODS,
  WRAPPER_METHODS,
  ZOD_MINI_METHODS,
} from '../src/lib/constants';
import { SUPPORTED_CHAIN_CHECK_METHODS } from '../src/lib/checks';

export interface GoldenMethodCase {
  title: string;
  input: string;
  expected: string;
}

function getMiniMethodName(methodName: string): string {
  return ZOD_MINI_METHODS[methodName] || methodName;
}

function getSupportedMiniMethods(): Set<string> {
  const supported = new Set<string>();
  const allMethods = new Set<string>([
    ...BASE_METHODS,
    ...SUPPORTED_CHAIN_CHECK_METHODS,
    ...FUNCTIONAL_CHECK_METHODS,
    ...WRAPPER_METHODS,
  ]);

  for (const methodName of allMethods) {
    if (methodName === 'nonempty') {
      supported.add('minLength');
      continue;
    }

    if (methodName === 'or') {
      supported.add('union');
      continue;
    }

    if (methodName === 'transform') {
      supported.add('pipe');
      supported.add(getMiniMethodName(methodName));
      continue;
    }

    if (methodName === 'brand') {
      continue;
    }

    supported.add(getMiniMethodName(methodName));
  }

  for (const mode of OBJECT_MODE_METHODS) {
    supported.add(`${mode}Object`);
  }

  supported.add('check');

  return supported;
}

export const TRANSFORMER_SUPPORTED_MINI_METHODS = getSupportedMiniMethods();
export const TRANSFORMER_VIRTUAL_MINI_METHODS = new Set<string>();
export const SUPPORTED_PASSTHROUGH_MINI_METHODS = new Set<string>([
  '_function',
  'base64',
  'base64url',
  'cidrv4',
  'cidrv6',
  'cuid',
  'cuid2',
  'custom',
  'e164',
  'emoji',
  'exactOptional',
  'file',
  'float32',
  'float64',
  'function',
  'guid',
  'hash',
  'hex',
  'hostname',
  'httpUrl',
  'instanceof',
  'int32',
  'int64',
  'json',
  'jwt',
  'keyof',
  'ksuid',
  'lazy',
  'looseRecord',
  'mac',
  'merge',
  'nanoid',
  'nonoptional',
  'partialRecord',
  'stringFormat',
  'success',
  'templateLiteral',
  'uint32',
  'uint64',
  'ulid',
  'uuidv4',
  'uuidv6',
  'uuidv7',
  'xid',
  'xor',
  'clone',
  'codec',
  'config',
  'decode',
  'decodeAsync',
  'encode',
  'encodeAsync',
  'flattenError',
  'formatError',
  'invertCodec',
  'parse',
  'parseAsync',
  'prettifyError',
  'registry',
  'safeDecode',
  'safeDecodeAsync',
  'safeEncode',
  'safeEncodeAsync',
  'safeExtend',
  'safeParse',
  'safeParseAsync',
  'toJSONSchema',
  'treeifyError',
]);

// Kept to validate formerly-excluded methods are now supported passthroughs.
export const FORMERLY_EXCLUDED_MINI_RUNTIME_FUNCTIONS = new Set<string>([
  'clone',
  'codec',
  'config',
  'decode',
  'decodeAsync',
  'encode',
  'encodeAsync',
  'flattenError',
  'formatError',
  'invertCodec',
  'parse',
  'parseAsync',
  'prettifyError',
  'registry',
  'safeDecode',
  'safeDecodeAsync',
  'safeEncode',
  'safeEncodeAsync',
  'safeExtend',
  'safeParse',
  'safeParseAsync',
  'toJSONSchema',
  'treeifyError',
]);

export const EXCLUDED_MINI_RUNTIME_FUNCTIONS = new Set<string>();

export const GOLDEN_METHOD_CASES: GoldenMethodCase[] = [
  {
    title: 'maps string min to minLength check',
    input: 'z.string().min(5)',
    expected: 'z.string().check(z.minLength(5))',
  },
  {
    title: 'maps number min and max to gte/lte',
    input: 'z.number().min(1).max(10)',
    expected: 'z.number().check(z.gte(1), z.lte(10))',
  },
  {
    title: 'maps nonempty with default arg',
    input: 'z.string().nonempty()',
    expected: 'z.string().check(z.minLength(1))',
  },
  {
    title: 'maps optional wrapper',
    input: 'z.string().optional()',
    expected: 'z.optional(z.string())',
  },
  {
    title: 'maps transform wrapper to pipe',
    input: 'z.string().transform((value) => value.trim())',
    expected: 'z.pipe(z.string(), z.transform(value => value.trim()))',
  },
  {
    title: 'maps or wrapper to union',
    input: 'z.string().or(z.number())',
    expected: 'z.union([z.string(), z.number()])',
  },
  {
    title: 'maps loose object mode',
    input: 'z.object({ id: z.number() }).loose()',
    expected: 'z.looseObject({ id: z.number() })',
  },
  {
    title: 'maps strict object mode',
    input: 'z.object({ id: z.number() }).strict()',
    expected: 'z.strictObject({ id: z.number() })',
  },
  {
    title: 'maps extend wrappers to top-level extend',
    input: 'z.object({ id: z.number() }).extend(z.object({ name: z.string() }))',
    expected: 'z.extend(z.object({ id: z.number() }), { name: z.string() })',
  },
];

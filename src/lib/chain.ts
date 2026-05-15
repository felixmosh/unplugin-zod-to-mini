import type * as swc from '@swc/core';
import { ZOD_MINI_METHODS } from './constants';

export type ChainMethod = { name: string; args: swc.Expression[] };

function isIdentifier(node: unknown): node is swc.Identifier {
  return Boolean(
    node && typeof node === 'object' && (node as { type?: string }).type === 'Identifier',
  );
}

function isCallExpression(node: unknown): node is swc.CallExpression {
  return Boolean(
    node && typeof node === 'object' && (node as { type?: string }).type === 'CallExpression',
  );
}

function isMemberExpression(node: unknown): node is swc.MemberExpression {
  return Boolean(
    node && typeof node === 'object' && (node as { type?: string }).type === 'MemberExpression',
  );
}

export function getZodChain(expression: swc.Expression): {
  base: swc.Expression;
  methods: ChainMethod[];
} {
  const methods: ChainMethod[] = [];
  let current = expression;

  while (true) {
    if (
      isCallExpression(current) &&
      isMemberExpression(current.callee) &&
      isIdentifier(current.callee.property)
    ) {
      methods.unshift({
        name: current.callee.property.value,
        args: current.arguments.map((argument) => argument.expression),
      });
      current = current.callee.object;
    } else if (isMemberExpression(current) && isIdentifier(current.property)) {
      methods.unshift({ name: current.property.value, args: [] });
      current = current.object;
    } else {
      break;
    }
  }

  return { base: current, methods };
}

export function getCheckMethodName(methodName: string, baseMethodName?: string): string {
  if (baseMethodName === 'number') {
    if (methodName === 'min') {
      return 'gte';
    }

    if (methodName === 'max') {
      return 'lte';
    }
  }

  return ZOD_MINI_METHODS[methodName] || methodName;
}

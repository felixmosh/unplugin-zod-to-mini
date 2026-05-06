import { parseSync, printSync } from '@swc/core';
import type * as swc from '@swc/core';
import { Visitor } from '@swc/core/Visitor';

const DUMMY_SPAN = { start: 0, end: 0, ctxt: 0 };

const ZOD_MINI_METHODS: Record<string, string> = {
  optional: 'optional',
  nullable: 'nullable',
  nullish: 'nullish',
  string: 'string',
  stringbool: 'stringbool',
  number: 'number',
  bigint: 'bigint',
  boolean: 'boolean',
  symbol: 'symbol',
  object: 'object',
  array: 'array',
  min: 'minLength',
  max: 'maxLength',
  lt: 'lt',
  lte: 'lte',
  maximum: 'maximum',
  gt: 'gt',
  gte: 'gte',
  minimum: 'minimum',
  length: 'length',
  trim: 'trim',
  email: 'email',
  url: 'url',
  ipv4: 'ipv4',
  ipv6: 'ipv6',
  uuid: 'uuid',
  int: 'int',
  negative: 'negative',
  nonpositive: 'nonpositive',
  nonnegative: 'nonnegative',
  multipleOf: 'multipleOf',
  step: 'multipleOf',
  maxSize: 'maxSize',
  minSize: 'minSize',
  size: 'size',
  maxLength: 'maxLength',
  minLength: 'minLength',
  regex: 'regex',
  lowercase: 'lowercase',
  uppercase: 'uppercase',
  includes: 'includes',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  property: 'property',
  mime: 'mime',
  literal: 'literal',
  enum: 'enum',
  nativeEnum: 'nativeEnum',
  union: 'union',
  or: 'union',
  intersection: 'intersection',
  and: 'intersection',
  extend: 'extend',
  omit: 'omit',
  pick: 'pick',
  discriminatedUnion: 'discriminatedUnion',
  partial: 'partial',
  record: 'record',
  map: 'map',
  set: 'set',
  tuple: 'tuple',
  promise: 'promise',
  date: 'date',
  undefined: 'undefined',
  null: 'null',
  void: 'void',
  any: 'any',
  unknown: 'unknown',
  never: 'never',
  nan: 'nan',
  default: '_default',
  prefault: 'prefault',
  describe: 'describe',
  brand: 'brand',
  readonly: 'readonly',
  catch: 'catch',
  catchall: 'catchall',
  pipe: 'pipe',
  transform: 'transform',
  refine: 'refine',
  superRefine: 'superRefine',
  overwrite: 'overwrite',
  normalize: 'normalize',
  toLowerCase: 'toLowerCase',
  toUpperCase: 'toUpperCase',
  meta: 'meta',
  positive: 'positive',
  required: 'required',
};

const CHECK_METHODS = [
  'min',
  'max',
  'lt',
  'lte',
  'maximum',
  'gt',
  'gte',
  'minimum',
  'length',
  'trim',
  'email',
  'url',
  'ipv4',
  'ipv6',
  'uuid',
  'int',
  'toLowerCase',
  'toUpperCase',
  'startsWith',
  'endsWith',
  'includes',
  'regex',
  'date',
  'iso',
  'positive',
  'negative',
  'nonpositive',
  'nonnegative',
  'multipleOf',
  'step',
  'maxSize',
  'minSize',
  'size',
  'maxLength',
  'minLength',
  'lowercase',
  'uppercase',
  'property',
  'mime',
  'refine',
  'superRefine',
  'nonempty',
  'overwrite',
  'normalize',
  'meta',
  'describe',
  'discriminatedUnion',
];

const BASE_METHODS = [
  'string',
  'stringbool',
  'number',
  'bigint',
  'boolean',
  'symbol',
  'object',
  'looseObject',
  'strictObject',
  'array',
  'pipe',
  'literal',
  'enum',
  'nativeEnum',
  'union',
  'intersection',
  'record',
  'map',
  'set',
  'tuple',
  'promise',
  'date',
  'undefined',
  'null',
  'void',
  'any',
  'unknown',
  'never',
  'nan',
  'email',
  'url',
  'ipv4',
  'ipv6',
  'discriminatedUnion',
  'optional',
  'nullable',
  'nullish',
  '_default',
  'prefault',
  'catch',
  'catchall',
  'partial',
  'required',
  'readonly',
  'extend',
  'omit',
  'pick',
];

const WRAPPER_METHODS = [
  'optional',
  'nullable',
  'nullish',
  'transform',
  'default',
  'prefault',
  'catch',
  'catchall',
  'required',
  'array',
  'pipe',
  'readonly',
  'brand',
  'or',
  'and',
  'extend',
  'omit',
  'pick',
  'partial',
];

const STANDALONE_WRAPPER_METHODS = [
  'optional',
  'nullable',
  'nullish',
  'partial',
  'transform',
  'default',
  'prefault',
  'catch',
  'catchall',
  'required',
  'array',
  'pipe',
  'readonly',
  'brand',
  'or',
  'and',
  'extend',
  'omit',
  'pick',
];

const FUNCTIONAL_CHECK_METHODS = ['email', 'url', 'ipv4', 'ipv6'];
const PASSTHROUGH_METHODS = ['parse', 'check', 'apply'];
const OBJECT_MODE_METHODS = ['loose', 'strict'];
const ZOD_SCHEMA_CONTEXT_METHODS = [
  'object',
  'looseObject',
  'strictObject',
  'array',
  'union',
  'intersection',
  'discriminatedUnion',
  'record',
  'map',
  'set',
  'tuple',
  'promise',
  'optional',
  'nullable',
  'nullish',
  '_default',
  'prefault',
  'catch',
  'catchall',
  'extend',
  'partial',
  'required',
  'pipe',
  'readonly',
];

interface ZodBinding {
  importDeclaration: swc.ImportDeclaration;
  localName: string;
}

interface TransformOptions {
  filename?: string;
  sourceMaps?: boolean;
  inputSourceMap?: unknown;
}

interface TransformResult {
  code: string;
  map: unknown;
}

interface TransformContext extends TransformOptions {
  zodLocalName: string;
  schemaLocalNames: Set<string>;
}

type ChainMethod = { name: string; args: swc.Expression[] };

function id(value: string): swc.Identifier {
  return {
    type: 'Identifier',
    span: DUMMY_SPAN,
    ctxt: 0,
    value,
    optional: false,
  } as unknown as swc.Identifier;
}

function stringLiteral(value: string): swc.StringLiteral {
  return {
    type: 'StringLiteral',
    span: DUMMY_SPAN,
    value,
    raw: JSON.stringify(value),
  };
}

function numericLiteral(value: number): swc.NumericLiteral {
  return {
    type: 'NumericLiteral',
    span: DUMMY_SPAN,
    value,
    raw: String(value),
  };
}

function exprArg(expression: swc.Expression): swc.Argument {
  return {
    spread: undefined,
    expression,
  };
}

function member(object: swc.Expression, property: string): swc.MemberExpression {
  return {
    type: 'MemberExpression',
    span: DUMMY_SPAN,
    object,
    property: id(property),
  };
}

function call(callee: swc.Expression, args: swc.Expression[] = []): swc.CallExpression {
  return {
    type: 'CallExpression',
    span: DUMMY_SPAN,
    ctxt: 0,
    callee,
    arguments: args.map(exprArg),
    typeArguments: undefined,
  } as unknown as swc.CallExpression;
}

function arrayExpression(elements: swc.Expression[]): swc.ArrayExpression {
  return {
    type: 'ArrayExpression',
    span: DUMMY_SPAN,
    elements: elements.map(exprArg),
  };
}

function zodIdentifier(context: TransformContext): swc.Identifier {
  return id(context.zodLocalName);
}

function zodMember(context: TransformContext, name: string): swc.MemberExpression {
  return member(zodIdentifier(context), name);
}

function isIdentifier(node: unknown, value?: string): node is swc.Identifier {
  return (
    Boolean(node && typeof node === 'object' && (node as { type?: string }).type === 'Identifier') &&
    (value === undefined || (node as swc.Identifier).value === value)
  );
}

function isCallExpression(node: unknown): node is swc.CallExpression {
  return Boolean(node && typeof node === 'object' && (node as { type?: string }).type === 'CallExpression');
}

function isMemberExpression(node: unknown): node is swc.MemberExpression {
  return Boolean(node && typeof node === 'object' && (node as { type?: string }).type === 'MemberExpression');
}

function isZodSpecifier(
  specifier: swc.ImportSpecifier | swc.ImportDefaultSpecifier | swc.ImportNamespaceSpecifier
): boolean {
  if (specifier.type === 'ImportSpecifier') {
    return (!specifier.imported || isIdentifier(specifier.imported, 'z')) && isIdentifier(specifier.local);
  }

  return specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier';
}

function getZodBinding(ast: swc.Module): ZodBinding | undefined {
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration' || node.source.value !== 'zod') {
      continue;
    }

    const specifier = node.specifiers.find(isZodSpecifier);
    if (!specifier) {
      continue;
    }

    return {
      importDeclaration: node,
      localName: specifier.local.value,
    };
  }

  return undefined;
}

function rewriteZodImportToMini(importDeclaration: swc.ImportDeclaration): void {
  importDeclaration.source = stringLiteral('zod/mini');
  importDeclaration.specifiers = importDeclaration.specifiers.map((specifier) => {
    if (specifier.type !== 'ImportDefaultSpecifier') {
      return specifier;
    }

    return {
      type: 'ImportSpecifier',
      span: DUMMY_SPAN,
      local: id(specifier.local.value),
      imported: specifier.local.value === 'z' ? undefined : id('z'),
      isTypeOnly: false,
    };
  });
}

function buildBaseExpression(base: swc.Expression, methods: ChainMethod[], baseMethodIndex: number): swc.Expression {
  let current = base;

  for (let i = 0; i <= baseMethodIndex; i++) {
    const method = methods[i];
    const currentMember = member(current, method.name);
    current = i === baseMethodIndex ? call(currentMember, method.args) : currentMember;
  }

  return current;
}

function getZodChain(expression: swc.Expression): { base: swc.Expression; methods: ChainMethod[] } {
  const methods: ChainMethod[] = [];
  let current = expression;

  while (true) {
    if (isCallExpression(current) && isMemberExpression(current.callee) && isIdentifier(current.callee.property)) {
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

function transformZodChain(base: swc.Expression, methods: ChainMethod[], context: TransformContext): swc.Expression {
  let baseMethodIndex = -1;
  for (let i = 0; i < methods.length; i++) {
    if (BASE_METHODS.includes(methods[i].name)) {
      baseMethodIndex = i;
      break;
    }
  }

  if (baseMethodIndex === -1) {
    return base;
  }

  let result = buildBaseExpression(base, methods, baseMethodIndex);
  const baseMethodName = methods[baseMethodIndex].name;
  const checkArgs: swc.Expression[] = [];
  const flushChecks = () => {
    if (checkArgs.length === 0) {
      return;
    }

    result = call(member(result, 'check'), checkArgs);
    checkArgs.length = 0;
  };

  for (let i = baseMethodIndex + 1; i < methods.length; i++) {
    const method = methods[i];

    if (FUNCTIONAL_CHECK_METHODS.includes(method.name)) {
      flushChecks();
      result = call(zodMember(context, ZOD_MINI_METHODS[method.name] || method.name), [result, ...method.args]);
    } else if (CHECK_METHODS.includes(method.name)) {
      const miniName = method.name === 'nonempty' ? 'minLength' : getCheckMethodName(method.name, baseMethodName);
      const args = method.name === 'nonempty' && method.args.length === 0 ? [numericLiteral(1)] : method.args;
      checkArgs.push(call(zodMember(context, miniName), args));
    } else if (OBJECT_MODE_METHODS.includes(method.name)) {
      flushChecks();
      result = applyObjectMode(result, method.name, context);
    } else if (WRAPPER_METHODS.includes(method.name)) {
      flushChecks();
      const miniName = ZOD_MINI_METHODS[method.name] || method.name;

      if (method.name === 'or') {
        result = call(zodMember(context, miniName), [arrayExpression([result, ...method.args])]);
      } else if (method.name === 'transform') {
        result = call(zodMember(context, 'pipe'), [result, call(zodMember(context, miniName), method.args)]);
      } else if (method.name === 'pipe') {
        result = call(zodMember(context, miniName), [result, ...method.args]);
      } else if (method.name === 'brand') {
        result = result;
      } else if (['extend', 'omit', 'pick'].includes(method.name)) {
        result = call(zodMember(context, miniName), [
          result,
          ...method.args.map((arg) => normalizeExtendArg(arg, context)),
        ]);
      } else {
        result = call(zodMember(context, miniName), [result, ...method.args]);
      }
    } else if (method.name === 'check') {
      checkArgs.push(...method.args);
    } else if (PASSTHROUGH_METHODS.includes(method.name)) {
      flushChecks();
      result = call(member(result, method.name), method.args);
    } else {
      throwUnsupportedZodMethod(method.name, context.filename);
    }
  }

  flushChecks();
  return result;
}

function throwUnsupportedZodMethod(methodName: string, filename?: string): never {
  const suffix = filename ? ` while processing ${filename}` : '';
  throw new Error(`Unsupported Zod method "${methodName}" in zod-mini-transform${suffix}`);
}

function applyObjectMode(result: swc.Expression, mode: string, context: TransformContext): swc.Expression {
  if (
    !isCallExpression(result) ||
    !isMemberExpression(result.callee) ||
    !isIdentifier(result.callee.object, context.zodLocalName) ||
    !isIdentifier(result.callee.property, 'object')
  ) {
    return result;
  }

  result.callee = zodMember(context, mode === 'loose' ? 'looseObject' : 'strictObject');
  return result;
}

function getCheckMethodName(methodName: string, baseMethodName?: string): string {
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

function normalizeExtendArg(arg: swc.Expression, context: TransformContext): swc.Expression {
  if (
    isCallExpression(arg) &&
    isMemberExpression(arg.callee) &&
    isIdentifier(arg.callee.object, context.zodLocalName) &&
    isIdentifier(arg.callee.property, 'object') &&
    arg.arguments[0]?.expression
  ) {
    return arg.arguments[0].expression;
  }

  return arg;
}

function transformStandaloneWrapper(
  expression: swc.Expression,
  context: TransformContext,
  allowUnmarkedSchemaBase = false
): swc.Expression | undefined {
  if (!isCallExpression(expression) || !isMemberExpression(expression.callee)) {
    return undefined;
  }

  const { base, methods } = getZodChain(expression);
  if (
    !isIdentifier(base) ||
    base.value === context.zodLocalName ||
    (!allowUnmarkedSchemaBase && !isKnownOrLikelySchemaIdentifier(base.value, context))
  ) {
    return undefined;
  }

  if (!methods.some((method) => STANDALONE_WRAPPER_METHODS.includes(method.name))) {
    return undefined;
  }

  context.schemaLocalNames.add(base.value);
  let result: swc.Expression = base;

  for (const method of methods) {
    if (CHECK_METHODS.includes(method.name)) {
      result = call(member(result, 'check'), [
        call(zodMember(context, ZOD_MINI_METHODS[method.name] || method.name), method.args),
      ]);
    } else if (method.name === 'or') {
      result = call(zodMember(context, 'union'), [arrayExpression([result, ...method.args])]);
    } else if (STANDALONE_WRAPPER_METHODS.includes(method.name)) {
      const miniName = ZOD_MINI_METHODS[method.name] || method.name;

      if (method.name === 'transform') {
        result = call(zodMember(context, 'pipe'), [result, call(zodMember(context, miniName), method.args)]);
      } else if (method.name === 'brand') {
        result = result;
      } else {
        const args =
          method.name === 'extend' ? method.args.map((arg) => normalizeExtendArg(arg, context)) : method.args;
        result = call(zodMember(context, miniName), [result, ...args]);
      }
    } else if (PASSTHROUGH_METHODS.includes(method.name)) {
      result = call(member(result, method.name), method.args);
    } else {
      return undefined;
    }
  }

  return result;
}

function hasUnsupportedStandaloneZodWrapper(
  expression: swc.Expression,
  context: TransformContext,
  allowUnmarkedSchemaBase = false
): boolean {
  if (!isCallExpression(expression) || !isMemberExpression(expression.callee)) {
    return false;
  }

  const { base, methods } = getZodChain(expression);
  if (
    !isIdentifier(base) ||
    base.value === context.zodLocalName ||
    (!allowUnmarkedSchemaBase && !isKnownOrLikelySchemaIdentifier(base.value, context))
  ) {
    return false;
  }

  if (!methods.some((method) => isSupportedStandaloneMethod(method.name))) {
    return false;
  }

  return methods.some((method) => !isSupportedStandaloneMethod(method.name));
}

function isSupportedStandaloneMethod(methodName: string): boolean {
  return (
    CHECK_METHODS.includes(methodName) ||
    STANDALONE_WRAPPER_METHODS.includes(methodName) ||
    PASSTHROUGH_METHODS.includes(methodName)
  );
}

function isLikelySchemaIdentifier(name: string): boolean {
  return /(?:schema|value|response|string)$/i.test(name) || /schema/i.test(name);
}

function isKnownOrLikelySchemaIdentifier(name: string, context: TransformContext): boolean {
  return context.schemaLocalNames.has(name) || isLikelySchemaIdentifier(name);
}

function getMemberRoot(memberExpression: swc.MemberExpression): swc.Expression {
  let current = memberExpression.object;
  while (isMemberExpression(current)) {
    current = current.object;
  }

  return current;
}

function isZodSchemaContextCall(expression: swc.Expression, context: TransformContext): boolean {
  if (
    !isCallExpression(expression) ||
    !isMemberExpression(expression.callee) ||
    !isIdentifier(expression.callee.property)
  ) {
    return false;
  }

  const root = getMemberRoot(expression.callee);
  return (
    isIdentifier(root, context.zodLocalName) && ZOD_SCHEMA_CONTEXT_METHODS.includes(expression.callee.property.value)
  );
}

function markSchemaDeclaration(
  target: swc.Pattern | swc.Expression,
  value: swc.Expression | undefined,
  context: TransformContext
): void {
  if (!isIdentifier(target) || !value) {
    return;
  }

  if (isSchemaExpression(value, context)) {
    context.schemaLocalNames.add(target.value);
  }
}

function isSchemaExpression(expression: swc.Expression, context: TransformContext): boolean {
  if (
    expression.type === 'TsAsExpression' ||
    expression.type === 'TsSatisfiesExpression' ||
    expression.type === 'TsTypeAssertion'
  ) {
    return isSchemaExpression(expression.expression, context);
  }

  if (isIdentifier(expression)) {
    return context.schemaLocalNames.has(expression.value);
  }

  if (isCallExpression(expression)) {
    if (isMemberExpression(expression.callee)) {
      if (isIdentifier(expression.callee.object, context.zodLocalName)) {
        return true;
      }

      if (isIdentifier(expression.callee.property, 'check')) {
        return isSchemaExpression(expression.callee.object, context);
      }
    }

    if (isIdentifier(expression.callee, context.zodLocalName)) {
      return true;
    }
  }

  return false;
}

function parseMap(map: string | undefined): unknown {
  if (!map) {
    return null;
  }

  try {
    return JSON.parse(map);
  } catch {
    return map;
  }
}

function stringifyInputSourceMap(inputSourceMap: unknown): string | undefined {
  if (!inputSourceMap) {
    return undefined;
  }

  return typeof inputSourceMap === 'string' ? inputSourceMap : JSON.stringify(inputSourceMap);
}

class ZodMiniSwcVisitor extends Visitor {
  private functionDepth = 0;
  private schemaContextDepth = 0;

  constructor(private readonly context: TransformContext) {
    super();
  }

  visitFunction<T extends swc.Fn>(node: T): T {
    this.functionDepth++;
    const result = super.visitFunction(node);
    this.functionDepth--;
    return result;
  }

  visitArrowFunctionExpression(node: swc.ArrowFunctionExpression): swc.Expression {
    this.functionDepth++;
    const result = super.visitArrowFunctionExpression(node);
    this.functionDepth--;
    return result;
  }

  visitTsType<T extends swc.TsType>(node: T): T {
    return node;
  }

  visitTsTypeAnnotation(node: swc.TsTypeAnnotation): swc.TsTypeAnnotation {
    return node;
  }

  visitTsTypeParameterDeclaration(node: swc.TsTypeParameterDeclaration): swc.TsTypeParameterDeclaration {
    return node;
  }

  visitTsTypeParameterInstantiation(
    node: swc.TsTypeParameterInstantiation | undefined
  ): swc.TsTypeParameterInstantiation | undefined {
    return node;
  }

  visitVariableDeclarator(node: swc.VariableDeclarator): swc.VariableDeclarator {
    const result = super.visitVariableDeclarator(node);
    markSchemaDeclaration(result.id, result.init ?? undefined, this.context);
    return result;
  }

  visitAssignmentExpression(node: swc.AssignmentExpression): swc.Expression {
    const result = super.visitAssignmentExpression(node) as swc.AssignmentExpression;
    markSchemaDeclaration(result.left, result.right, this.context);
    return result;
  }

  visitCallExpression(node: swc.CallExpression): swc.Expression {
    const isSchemaContext = isZodSchemaContextCall(node, this.context);
    if (isSchemaContext) {
      this.schemaContextDepth++;
    }

    const visited = super.visitCallExpression(node) as swc.CallExpression;

    if (isSchemaContext) {
      this.schemaContextDepth--;
    }

    return this.transformVisitedCall(visited);
  }

  private transformVisitedCall(node: swc.CallExpression): swc.Expression {
    const insideFunction = this.functionDepth > 0;
    const insideSchemaContext = !insideFunction && this.schemaContextDepth > 0;

    const standaloneWrapper = transformStandaloneWrapper(node, this.context, insideSchemaContext);
    if (standaloneWrapper) {
      return standaloneWrapper;
    }

    if (!insideFunction && hasUnsupportedStandaloneZodWrapper(node, this.context, insideSchemaContext)) {
      const { methods } = getZodChain(node);
      const unsupported = methods.find((method) => !isSupportedStandaloneMethod(method.name));
      throwUnsupportedZodMethod(unsupported?.name ?? 'unknown', this.context.filename);
    }

    if (!isMemberExpression(node.callee)) {
      return node;
    }

    const { base, methods } = getZodChain(node);
    if (!isIdentifier(base, this.context.zodLocalName) || methods.length === 0) {
      return node;
    }

    if (!methods.some((method) => BASE_METHODS.includes(method.name))) {
      return node;
    }

    return transformZodChain(base, methods, this.context);
  }
}

export function transformZodToMiniWithSourceMap(code: string, options: TransformOptions = {}): TransformResult {
  const ast = parseSync(code, {
    syntax: 'typescript',
    tsx: false,
  });

  const zodBinding = getZodBinding(ast);
  if (!zodBinding) {
    return {
      code,
      map: options.sourceMaps ? (options.inputSourceMap ?? null) : null,
    };
  }

  const context: TransformContext = {
    ...options,
    zodLocalName: zodBinding.localName,
    schemaLocalNames: new Set(),
  };

  rewriteZodImportToMini(zodBinding.importDeclaration);

  const visitor = new ZodMiniSwcVisitor(context);
  const transformedAst = visitor.visitModule(ast);
  const output = printSync(transformedAst, {
    filename: options.filename,
    sourceFileName: options.filename,
    sourceMaps: options.sourceMaps,
  });

  return {
    code: output.code,
    map: options.sourceMaps ? parseMap(output.map) : null,
  };
}

export function transformZodToMini(code: string, options: TransformOptions = {}): string {
  return transformZodToMiniWithSourceMap(code, options).code;
}

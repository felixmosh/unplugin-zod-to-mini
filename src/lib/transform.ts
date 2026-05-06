import type * as swc from '@swc/core';
import { parseSync, printSync } from '@swc/core';
import { Visitor } from '@swc/core/Visitor';
import { PluginOptions } from '../types';
import { isSupportedChainCheckMethod, SUPPORTED_CHAIN_CHECK_METHODS } from './checks';
import { type ChainMethod, getCheckMethodName, getZodChain } from './chain';
import {
  BASE_METHODS,
  FUNCTIONAL_CHECK_METHODS,
  OBJECT_MODE_METHODS,
  PASSTHROUGH_METHODS,
  PASSTHROUGH_BASE_METHODS,
  STANDALONE_WRAPPER_METHODS,
  WRAPPER_METHODS,
  ZOD_MINI_METHODS,
  ZOD_SCHEMA_CONTEXT_METHODS,
} from './constants';

const DUMMY_SPAN = { start: 0, end: 0, ctxt: 0 };

interface ZodBinding {
  importDeclaration: swc.ImportDeclaration;
  localName: string;
}

interface TransformOptions extends PluginOptions {
  filename?: string;
}

interface TransformResult {
  code: string;
  map?: string;
}

interface TransformContext extends TransformOptions {
  zodLocalName: string;
  schemaLocalNames: Set<string>;
}

function id(value: string): swc.Identifier {
  return {
    type: "Identifier",
    span: DUMMY_SPAN,
    ctxt: 0,
    value,
    optional: false,
  } as unknown as swc.Identifier;
}

function stringLiteral(value: string): swc.StringLiteral {
  return {
    type: "StringLiteral",
    span: DUMMY_SPAN,
    value,
    raw: JSON.stringify(value),
  };
}

function numericLiteral(value: number): swc.NumericLiteral {
  return {
    type: "NumericLiteral",
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
    type: "MemberExpression",
    span: DUMMY_SPAN,
    object,
    property: id(property),
  };
}

function call(callee: swc.Expression, args: swc.Expression[] = []): swc.CallExpression {
  return {
    type: "CallExpression",
    span: DUMMY_SPAN,
    ctxt: 0,
    callee,
    arguments: args.map(exprArg),
    typeArguments: undefined,
  } as unknown as swc.CallExpression;
}

function arrayExpression(elements: swc.Expression[]): swc.ArrayExpression {
  return {
    type: "ArrayExpression",
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
    Boolean(
      node && typeof node === "object" && (node as { type?: string }).type === "Identifier",
    ) &&
    (value === undefined || (node as swc.Identifier).value === value)
  );
}

function isCallExpression(node: unknown): node is swc.CallExpression {
  return Boolean(
    node && typeof node === "object" && (node as { type?: string }).type === "CallExpression",
  );
}

function isMemberExpression(node: unknown): node is swc.MemberExpression {
  return Boolean(
    node && typeof node === "object" && (node as { type?: string }).type === "MemberExpression",
  );
}

function isZodSpecifier(
  specifier: swc.ImportSpecifier | swc.ImportDefaultSpecifier | swc.ImportNamespaceSpecifier,
): boolean {
  if (specifier.type === "ImportSpecifier") {
    return (
      (!specifier.imported || isIdentifier(specifier.imported, "z")) &&
      isIdentifier(specifier.local)
    );
  }

  return (
    specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportNamespaceSpecifier"
  );
}

function getZodBinding(ast: swc.Module): ZodBinding | undefined {
  for (const node of ast.body) {
    if (node.type !== "ImportDeclaration" || node.source.value !== "zod") {
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
  importDeclaration.source = stringLiteral("zod/mini");
  importDeclaration.specifiers = importDeclaration.specifiers.map((specifier) => {
    if (specifier.type !== "ImportDefaultSpecifier") {
      return specifier;
    }

    return {
      type: "ImportSpecifier",
      span: DUMMY_SPAN,
      local: id(specifier.local.value),
      imported: specifier.local.value === "z" ? undefined : id("z"),
      isTypeOnly: false,
    };
  });
}

function buildBaseExpression(
  base: swc.Expression,
  methods: ChainMethod[],
  baseMethodIndex: number,
): swc.Expression {
  let current = base;

  for (let i = 0; i <= baseMethodIndex; i++) {
    const method = methods[i];
    const currentMember = member(current, method.name);
    current = i === baseMethodIndex ? call(currentMember, method.args) : currentMember;
  }

  return current;
}

interface ChainTransformState {
  result: swc.Expression;
  checkArgs: swc.Expression[];
  baseMethodName: string;
  context: TransformContext;
}

type ChainMethodHandler = (state: ChainTransformState, method: ChainMethod) => void;
type StandaloneMethodHandler = (state: StandaloneTransformState, method: ChainMethod) => void;

function flushPendingChecks(state: ChainTransformState): void {
  if (state.checkArgs.length === 0) {
    return;
  }

  state.result = call(member(state.result, "check"), state.checkArgs);
  state.checkArgs.length = 0;
}

function getMiniMethodName(methodName: string): string {
  return ZOD_MINI_METHODS[methodName] || methodName;
}

function createZodChainMethodHandlers(): Record<string, ChainMethodHandler> {
  const handlers: Record<string, ChainMethodHandler> = {};

  for (const methodName of FUNCTIONAL_CHECK_METHODS) {
    handlers[methodName] = (state, method) => {
      flushPendingChecks(state);
      state.result = call(zodMember(state.context, getMiniMethodName(method.name)), [
        state.result,
        ...method.args,
      ]);
    };
  }

  for (const methodName of SUPPORTED_CHAIN_CHECK_METHODS) {
    if (handlers[methodName]) {
      continue;
    }

    handlers[methodName] = (state, method) => {
      const miniName =
        method.name === "nonempty"
          ? "minLength"
          : getCheckMethodName(method.name, state.baseMethodName);
      const args =
        method.name === "nonempty" && method.args.length === 0 ? [numericLiteral(1)] : method.args;
      state.checkArgs.push(call(zodMember(state.context, miniName), args));
    };
  }

  for (const methodName of OBJECT_MODE_METHODS) {
    handlers[methodName] = (state, method) => {
      flushPendingChecks(state);
      state.result = applyObjectMode(state.result, method.name, state.context);
    };
  }

  for (const methodName of WRAPPER_METHODS) {
    handlers[methodName] = (state, method) => {
      flushPendingChecks(state);
      const miniName = getMiniMethodName(method.name);

      if (method.name === "or") {
        state.result = call(zodMember(state.context, miniName), [
          arrayExpression([state.result, ...method.args]),
        ]);
        return;
      }

      if (method.name === "transform") {
        state.result = call(zodMember(state.context, "pipe"), [
          state.result,
          call(zodMember(state.context, miniName), method.args),
        ]);
        return;
      }

      if (method.name === "pipe") {
        state.result = call(zodMember(state.context, miniName), [state.result, ...method.args]);
        return;
      }

      if (method.name === "brand") {
        return;
      }

      if (["extend", "omit", "pick"].includes(method.name)) {
        state.result = call(zodMember(state.context, miniName), [
          state.result,
          ...method.args.map((arg) => normalizeExtendArg(arg, state.context)),
        ]);
        return;
      }

      state.result = call(zodMember(state.context, miniName), [state.result, ...method.args]);
    };
  }

  handlers.check = (state, method) => {
    state.checkArgs.push(...method.args);
  };

  for (const methodName of PASSTHROUGH_METHODS) {
    if (methodName === "check") {
      continue;
    }

    handlers[methodName] = (state, method) => {
      flushPendingChecks(state);
      state.result = call(member(state.result, method.name), method.args);
    };
  }

  return handlers;
}

const ZOD_CHAIN_METHOD_HANDLERS = createZodChainMethodHandlers();

interface StandaloneTransformState {
  result: swc.Expression;
  context: TransformContext;
}

function createStandaloneMethodHandlers(): Record<string, StandaloneMethodHandler> {
  const handlers: Record<string, StandaloneMethodHandler> = {};

  for (const methodName of OBJECT_MODE_METHODS) {
    handlers[methodName] = (state, method) => {
      state.result = applyStandaloneObjectMode(state.result, method.name, state.context);
    };
  }

  for (const methodName of SUPPORTED_CHAIN_CHECK_METHODS) {
    handlers[methodName] = (state, method) => {
      state.result = call(member(state.result, "check"), [
        call(zodMember(state.context, getMiniMethodName(method.name)), method.args),
      ]);
    };
  }

  handlers.or = (state, method) => {
    state.result = call(zodMember(state.context, "union"), [
      arrayExpression([state.result, ...method.args]),
    ]);
  };

  for (const methodName of STANDALONE_WRAPPER_METHODS) {
    if (handlers[methodName]) {
      continue;
    }

    handlers[methodName] = (state, method) => {
      const miniName = getMiniMethodName(method.name);

      if (method.name === "transform") {
        state.result = call(zodMember(state.context, "pipe"), [
          state.result,
          call(zodMember(state.context, miniName), method.args),
        ]);
        return;
      }

      if (method.name === "brand") {
        return;
      }

      const args =
        method.name === "extend"
          ? method.args.map((arg) => normalizeExtendArg(arg, state.context))
          : method.args;
      state.result = call(zodMember(state.context, miniName), [state.result, ...args]);
    };
  }

  for (const methodName of PASSTHROUGH_METHODS) {
    handlers[methodName] = (state, method) => {
      state.result = call(member(state.result, method.name), method.args);
    };
  }

  return handlers;
}

const STANDALONE_METHOD_HANDLERS = createStandaloneMethodHandlers();

function transformZodChain(
  base: swc.Expression,
  methods: ChainMethod[],
  context: TransformContext,
): swc.Expression {
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

  const state: ChainTransformState = {
    result: buildBaseExpression(base, methods, baseMethodIndex),
    baseMethodName: methods[baseMethodIndex].name,
    checkArgs: [],
    context,
  };

  for (let i = baseMethodIndex + 1; i < methods.length; i++) {
    const method = methods[i];
    const handler = ZOD_CHAIN_METHOD_HANDLERS[method.name];
    if (!handler) {
      throwUnsupportedZodMethod(method.name, context.filename);
    }

    handler(state, method);
  }

  flushPendingChecks(state);
  return state.result;
}

function throwUnsupportedZodMethod(methodName: string, filename?: string): never {
  const suffix = filename ? ` while processing ${filename}` : "";
  throw new Error(`Unsupported Zod method "${methodName}" in zod-mini-transform${suffix}`);
}

function applyObjectMode(
  result: swc.Expression,
  mode: string,
  context: TransformContext,
): swc.Expression {
  if (
    !isCallExpression(result) ||
    !isMemberExpression(result.callee) ||
    !isIdentifier(result.callee.object, context.zodLocalName) ||
    !isIdentifier(result.callee.property)
  ) {
    return result;
  }

  const miniName = getObjectModeMiniName(mode);

  if (result.callee.property.value === "object") {
    result.callee = zodMember(context, miniName);
    return result;
  }

  if (
    ["extend", "pick", "omit", "partial", "required", "strictObject", "looseObject"].includes(
      result.callee.property.value,
    )
  ) {
    return call(zodMember(context, miniName), [member(result, "shape")]);
  }

  return result;
}

function applyStandaloneObjectMode(
  result: swc.Expression,
  mode: string,
  context: TransformContext,
): swc.Expression {
  const objectMode = applyObjectMode(result, mode, context);
  if (objectMode !== result) {
    return objectMode;
  }

  return call(zodMember(context, getObjectModeMiniName(mode)), [
    member(result, "shape"),
  ]);
}

function getObjectModeMiniName(mode: string): string {
  return `${mode}Object`;
}

function normalizeExtendArg(arg: swc.Expression, context: TransformContext): swc.Expression {
  if (
    isCallExpression(arg) &&
    isMemberExpression(arg.callee) &&
    isIdentifier(arg.callee.object, context.zodLocalName) &&
    isIdentifier(arg.callee.property, "object") &&
    arg.arguments[0]?.expression
  ) {
    return arg.arguments[0].expression;
  }

  return arg;
}

function transformStandaloneWrapper(
  expression: swc.Expression,
  context: TransformContext,
  allowUnmarkedSchemaBase = false,
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

  if (
    !methods.some(
      (method) =>
        STANDALONE_WRAPPER_METHODS.includes(method.name as any) ||
        OBJECT_MODE_METHODS.includes(method.name),
    )
  ) {
    return undefined;
  }

  context.schemaLocalNames.add(base.value);
  const state: StandaloneTransformState = {
    result: base,
    context,
  };

  for (const method of methods) {
    const handler = STANDALONE_METHOD_HANDLERS[method.name];
    if (!handler) {
      return undefined;
    }

    handler(state, method);
  }

  return state.result;
}

function hasUnsupportedStandaloneZodWrapper(
  expression: swc.Expression,
  context: TransformContext,
  allowUnmarkedSchemaBase = false,
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
    isSupportedChainCheckMethod(methodName) ||
    STANDALONE_WRAPPER_METHODS.includes(methodName as any) ||
    OBJECT_MODE_METHODS.includes(methodName) ||
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
    isIdentifier(root, context.zodLocalName) &&
    ZOD_SCHEMA_CONTEXT_METHODS.includes(expression.callee.property.value)
  );
}

function markSchemaDeclaration(
  target: swc.Pattern | swc.Expression,
  value: swc.Expression | undefined,
  context: TransformContext,
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
    expression.type === "TsAsExpression" ||
    expression.type === "TsSatisfiesExpression" ||
    expression.type === "TsTypeAssertion"
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

      if (isIdentifier(expression.callee.property, "check")) {
        return isSchemaExpression(expression.callee.object, context);
      }
    }

    if (isIdentifier(expression.callee, context.zodLocalName)) {
      return true;
    }
  }

  return false;
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

  visitTsTypeParameterDeclaration(
    node: swc.TsTypeParameterDeclaration,
  ): swc.TsTypeParameterDeclaration {
    return node;
  }

  visitTsTypeParameterInstantiation(
    node: swc.TsTypeParameterInstantiation | undefined,
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

    if (
      !insideFunction &&
      hasUnsupportedStandaloneZodWrapper(node, this.context, insideSchemaContext)
    ) {
      const { methods } = getZodChain(node);
      const unsupported = methods.find((method) => !isSupportedStandaloneMethod(method.name));
      throwUnsupportedZodMethod(unsupported?.name ?? "unknown", this.context.filename);
    }

    if (!isMemberExpression(node.callee)) {
      return node;
    }

    const { base, methods } = getZodChain(node);
    if (!isIdentifier(base, this.context.zodLocalName) || methods.length === 0) {
      return node;
    }

    if (!methods.some((method) => BASE_METHODS.includes(method.name))) {
      const unsupported = methods.find(
        (method) =>
          !PASSTHROUGH_BASE_METHODS.includes(method.name) && !ZOD_CHAIN_METHOD_HANDLERS[method.name],
      );
      if (unsupported) {
        throwUnsupportedZodMethod(unsupported.name, this.context.filename);
      }

      return node;
    }

    return transformZodChain(base, methods, this.context);
  }
}

export function transformZodToMiniWithSourceMap(
  code: string,
  options: TransformOptions = {},
): TransformResult | undefined {
  const ast = parseSync(code, {
    syntax: "typescript",
    tsx: options.jsx || false,
  });

  const zodBinding = getZodBinding(ast);
  if (!zodBinding) {
    return;
  }

  const context: TransformContext = {
    ...options,
    zodLocalName: zodBinding.localName,
    schemaLocalNames: new Set(),
  };

  rewriteZodImportToMini(zodBinding.importDeclaration);

  const visitor = new ZodMiniSwcVisitor(context);
  const transformedAst = visitor.visitModule(ast);
  return printSync(transformedAst, {
    filename: options.filename,
    sourceFileName: options.filename,
    sourceMaps: options.sourceMaps,
  });
}

export function transformZodToMini(
  code: string,
  options: TransformOptions = {},
): string | undefined {
  return transformZodToMiniWithSourceMap(code, options)?.code ?? code;
}

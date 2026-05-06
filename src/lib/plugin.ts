import path from 'path';
import type { Compiler, RspackPluginInstance } from '@rspack/core';

interface ZodMiniPluginOptions {
  include?: RegExp;
  exclude?: RegExp;
}

export class ZodMiniTransformPlugin implements RspackPluginInstance {
  private options: ZodMiniPluginOptions;

  constructor(options: ZodMiniPluginOptions = {}) {
    this.options = {
      include: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    const { include, exclude } = this.options;
    const loaderPath = path.resolve(__dirname, 'loader.js');

    compiler.options.module.rules.unshift({
      test: include,
      exclude,
      use: [loaderPath],
    });
  }
}

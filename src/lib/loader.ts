import { transformZodToMiniWithSourceMap } from './transform';

interface LoaderContext {
  resourcePath?: string;
  sourceMap?: boolean;
  callback?: (error: Error | null, content?: string | Buffer, sourceMap?: unknown) => void;
}

export default function zodMiniLoader(
  this: LoaderContext,
  source: string | Buffer,
  inputSourceMap?: unknown
): string | void {
  const code = Buffer.isBuffer(source) ? source.toString() : source;

  try {
    const transformed = transformZodToMiniWithSourceMap(code, {
      filename: this.resourcePath,
      sourceMaps: Boolean(this.sourceMap || inputSourceMap),
      inputSourceMap,
    });

    if (this.callback) {
      this.callback(null, transformed.code, transformed.map ?? inputSourceMap);
      return;
    }

    return transformed.code;
  } catch (err) {
    if (err instanceof Error && this.resourcePath && !err.message.includes(this.resourcePath)) {
      err.message = `${err.message} while processing ${this.resourcePath}`;
    }

    if (this.callback && err instanceof Error) {
      this.callback(err);
      return;
    }

    throw err;
  }
}

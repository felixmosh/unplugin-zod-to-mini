import type { UnpluginBuildContext, UnpluginFactory } from 'unplugin';
import { createUnplugin } from 'unplugin';
import { transformZodToMiniWithSourceMap } from './lib/transform';
import type { PluginOptions } from './types';

export const unpluginFactory: UnpluginFactory<PluginOptions | undefined> = (options) => ({
  name: 'unplugin-zod-to-mini',
  transform: {
    filter: {
      id: {
        include: /\.[c|m]?[t|j]sx?$/,
        exclude: /node_modules/,
      },
      code: /import\s+{.*}\s+from\s+['"]zod['"]/,
    },
    handler(code, id) {
      return transformZodToMiniWithSourceMap(code, { ...options, filename: id })
    },
  },
})

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin

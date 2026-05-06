import type { UnpluginFactory } from 'unplugin'
import { transformZodToMiniWithSourceMap } from './lib/transform';
import type { Options } from './types'
import { createUnplugin } from 'unplugin'

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => ({
  name: 'unplugin-zod-to-mini',
  transform:{
    filter: {
      id: {
        include: /\.[c|m]?[t|j]sx?$/,
        exclude: /node_modules/
      },
      code: /import\s+{.*}\s+from\s+['"]zod['"]/
    },
    handler(code, id) {
      transformZodToMiniWithSourceMap()
      return {}
    }
  },
})

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin

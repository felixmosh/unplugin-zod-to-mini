import type { PluginOptions } from './types'

import unplugin from '.'

export default (options: PluginOptions): any => ({
  name: 'unplugin-zod-to-mini',
  hooks: {
    'astro:config:setup': async (astro: any) => {
      astro.config.vite.plugins ||= []
      astro.config.vite.plugins.push(unplugin.vite(options))
    },
  },
})

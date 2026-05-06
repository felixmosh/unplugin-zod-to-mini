import type { PluginOptions } from './types'
import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import vite from './vite'
import webpack from './webpack'

export interface ModuleOptions extends PluginOptions {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-unplugin-zod-to-mini',
    configKey: 'unpluginStarter',
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))
    addWebpackPlugin(() => webpack(options))

    // ...
  },
})

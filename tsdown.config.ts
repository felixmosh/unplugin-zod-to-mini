import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/*.ts'],
  target: 'node22',
  format: ['cjs', 'esm'],
})

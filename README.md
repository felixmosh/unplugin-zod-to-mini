# unplugin-zod-to-mini

[![NPM version](https://img.shields.io/npm/v/unplugin-zod-to-mini?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-zod-to-mini)
 ![stability](https://img.shields.io/badge/stability-experimental-black)

A build-time transformer that converts Zod schemas to use [zod/mini](https://zod.dev/packages/mini) — a tree-shakable variant of Zod.

## Why zod/mini?

[Zod Mini](https://zod.dev/packages/mini) is a tree-shakable variant of Zod. It implements the exact same functionality, but with a functional API instead of method chaining.

### Bundle Size

Full Zod adds significant bundle weight to your application. zod/mini provides the same runtime validation with a fraction of the size. Based on the simple example `z.boolean().parse(true)`:

| Package  | Bundle size (gzip) |
| -------- | ------------------ |
| Zod Mini | `2.12kb`           |
| Zod      | `5.91kb`           |

For a more complex schema with objects (`z.object({ a: z.string(), b: z.number(), c: z.boolean() })`), the sizes are 4.0kb vs 13.1kb respectively.

This plugin automatically rewrites your Zod imports and transforms your schemas at build time, so you get the smaller bundle without changing your code.

### API Differences

In regular Zod, you use method chaining:

```ts
const mySchema = z.string().optional().nullable();
```

In Zod Mini, you use functions instead:

```ts
const mySchema = z.nullable(z.optional(z.string()));
```

For validation methods:

```ts
// regular Zod
z.string().min(5).max(10).trim();

// Zod Mini
z.string().check(z.minLength(5), z.maxLength(10), z.trim());
```

### When to Use This Plugin

Use this plugin if you want to:

- **Reduce bundle size** — Convert existing Zod schemas to Zod Mini without rewriting code
- **Reduce memory usage** — Particularly beneficial for backend services with many endpoints
- **Maintain DX** — Keep using the familiar Zod method-chaining API while getting Zod Mini benefits

Skip this plugin if you:

- Already use Zod Mini directly
- Prefer the functional Zod Mini API
- Don't have bundle size or memory constraints

### Real-world Impact

In our testing with a ~250 endpoint Fastify service using input & output schema validations, converting from regular Zod to Zod Mini **reduced memory consumption by ~20MB** from cold boot.

## Features

- Automatic transformation from `zod` to `zod/mini` import
- Supports most Zod methods: `string`, `number`, `boolean`, `object`, `array`, `enum`, `literal`, `optional`, `nullable`, etc.
- Transforms validation methods: `min`, `max`, `email`, `minLength`, `maxLength`, `uuid`, `url`, etc.
- Supports `transform`, `refine`, `pipe`, `brand`, `extend`, `omit`, `pick`
- Object mode transformations: `strictObject`, `looseObject`, `partial`, `required`
- Works with TypeScript and JSX

## Install

```bash
npm install unplugin-zod-to-mini
```

## Usage

### Vite

```ts
// vite.config.ts
import zodToMini from "unplugin-zod-to-mini/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [zodToMini()],
});
```

### Rollup

```ts
// rollup.config.js
import zodToMini from "unplugin-zod-to-mini/rollup";

export default {
  plugins: [zodToMini()],
};
```

### Webpack

```js
// webpack.config.js
module.exports = {
  plugins: [require("unplugin-zod-to-mini/webpack")()],
};
```

### Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["unplugin-zod-to-mini/nuxt"],
});
```

### esbuild

```ts
// esbuild.config.js
import { build } from "esbuild";
import zodToMini from "unplugin-zod-to-mini/esbuild";

build({
  plugins: [zodToMini()],
});
```

### Rspack

```ts
// rspack.config.js
import zodToMini from "unplugin-zod-to-mini/rspack";

export default {
  plugins: [
    zodToMini({
      // options
    }),
  ],
};
```

## Example

Before transformation:

```ts
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
  age: z.number().min(0).optional(),
});

export type User = z.infer<typeof UserSchema>;
```

After transformation (build output):

```ts
import { z } from "zod/mini";

const UserSchema = z.object({
  name: z.string().check(z.minLength(2), z.maxLength(50)),
  email: z.email(),
  age: z.optional(z.number().check(z.gte(0))),
});

export type User = z.infer<typeof UserSchema>;
```

## Options

```ts
interface PluginOptions {
  // Enable source maps for debugging
  sourceMaps?: boolean; // default: true
  // Enable JSX support
  jsx?: boolean; // default: false
}
```

## Limitations

- Some advanced Zod features may not be transformable — check the error message for unsupported methods and report them here :]

## Credits

- [zod/mini](https://zod.dev/packages/mini) — the lightweight Zod alternative
- [unplugin](https://github.com/unjs/unplugin) — the unified plugin system

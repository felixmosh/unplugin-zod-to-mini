import { describe, it } from 'vitest';
import { transformZodToMini } from '../src/lib/transform';
import { expectCode } from './codeExpect';

const transformZodSnippet = (code: string) => transformZodToMini(`import { z } from 'zod';\n${code}`);

describe('stress test: zod schema variations', () => {
  describe('primitives', () => {
    it('transforms string', () => {
      const input = `z.string()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string();`);
    });

    it('transforms number', () => {
      const input = `z.number()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number();`);
    });

    it('transforms bigint', () => {
      const input = `z.bigint()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint();`);
    });

    it('transforms boolean', () => {
      const input = `z.boolean()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.boolean();`);
    });

    it('transforms symbol', () => {
      const input = `z.symbol()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.symbol();`);
    });

    it('transforms undefined', () => {
      const input = `z.undefined()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.undefined();`);
    });

    it('transforms null', () => {
      const input = `z.null()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.null();`);
    });

    it('transforms void', () => {
      const input = `z.void()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.void();`);
    });

    it('transforms any', () => {
      const input = `z.any()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.any();`);
    });

    it('transforms unknown', () => {
      const input = `z.unknown()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.unknown();`);
    });

    it('transforms never', () => {
      const input = `z.never()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.never();`);
    });

    it('transforms nan', () => {
      const input = `z.nan()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.nan();`);
    });
  });

  describe('coercion', () => {
    it('transforms coerce.string', () => {
      const input = `z.coerce.string()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.coerce.string();`);
    });

    it('transforms coerce.number', () => {
      const input = `z.coerce.number()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.coerce.number();`);
    });

    it('transforms coerce.boolean', () => {
      const input = `z.coerce.boolean()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.coerce.boolean();`);
    });

    it('transforms coerce.bigint', () => {
      const input = `z.coerce.bigint()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.coerce.bigint();`);
    });

    it('transforms coerce.date', () => {
      const input = `z.coerce.date()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.coerce.date();`);
    });

    it('transforms coerce with type parameter', () => {
      const input = `z.coerce.number<number>()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.coerce.number();`);
    });
  });

  describe('literals', () => {
    it('transforms string literal', () => {
      const input = `z.literal("tuna")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.literal("tuna");`);
    });

    it('transforms number literal', () => {
      const input = `z.literal(12)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.literal(12);`);
    });

    it('transforms bigint literal', () => {
      const input = `z.literal(2n)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.literal(2n);`);
    });

    it('transforms boolean literal', () => {
      const input = `z.literal(true)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.literal(true);`);
    });

    it('transforms array of literals', () => {
      const input = `z.literal(["red", "green", "blue"])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.literal(["red", "green", "blue"]);`);
    });
  });

  describe('string validations', () => {
    it('transforms string().max', () => {
      const input = `z.string().max(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.maxLength(5));`);
    });

    it('transforms string().min', () => {
      const input = `z.string().min(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.minLength(5));`);
    });

    it('transforms string().length', () => {
      const input = `z.string().length(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.length(5));`);
    });

    it('transforms string().regex', () => {
      const input = `z.string().regex(/^[a-z]+$/)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.regex(/^[a-z]+$/));`);
    });

    it('transforms string().startsWith', () => {
      const input = `z.string().startsWith("aaa")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.startsWith("aaa"));`);
    });

    it('transforms string().endsWith', () => {
      const input = `z.string().endsWith("zzz")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.endsWith("zzz"));`);
    });

    it('transforms string().includes', () => {
      const input = `z.string().includes("---")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.includes("---"));`);
    });

    it('transforms string().trim', () => {
      const input = `z.string().trim()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.trim());`);
    });

    it('transforms string().toLowerCase', () => {
      const input = `z.string().toLowerCase()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.toLowerCase());`);
    });

    it('transforms string().toUpperCase', () => {
      const input = `z.string().toUpperCase()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.toUpperCase());`);
    });

    it('transforms string().normalize', () => {
      const input = `z.string().normalize()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.normalize());`);
    });

    it('transforms string().lowercase', () => {
      const input = `z.string().lowercase()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.lowercase());`);
    });

    it('transforms string().uppercase', () => {
      const input = `z.string().uppercase()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.uppercase());`);
    });
  });

  describe('string formats', () => {
    it('transforms email', () => {
      const input = `z.email()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.email();`);
    });

    it('transforms uuid', () => {
      const input = `z.uuid()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.uuid();`);
    });

    it('transforms uuid with version', () => {
      const input = `z.uuid({ version: "v4" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.uuid({ version: "v4" });`);
    });

    it('transforms uuidv4', () => {
      const input = `z.uuidv4()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.uuidv4();`);
    });

    it('transforms uuidv6', () => {
      const input = `z.uuidv6()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.uuidv6();`);
    });

    it('transforms uuidv7', () => {
      const input = `z.uuidv7()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.uuidv7();`);
    });

    it('transforms url', () => {
      const input = `z.url()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.url();`);
    });

    it('transforms url with options', () => {
      const input = `z.url({ protocol: /^https$/ })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.url({ protocol: /^https$/ });`);
    });

    it('transforms httpUrl', () => {
      const input = `z.httpUrl()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.httpUrl();`);
    });

    it('transforms hostname', () => {
      const input = `z.hostname()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.hostname();`);
    });

    it('transforms e164', () => {
      const input = `z.e164()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.e164();`);
    });

    it('transforms emoji', () => {
      const input = `z.emoji()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.emoji();`);
    });

    it('transforms base64', () => {
      const input = `z.base64()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.base64();`);
    });

    it('transforms base64url', () => {
      const input = `z.base64url()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.base64url();`);
    });

    it('transforms hex', () => {
      const input = `z.hex()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.hex();`);
    });

    it('transforms jwt', () => {
      const input = `z.jwt()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.jwt();`);
    });

    it('transforms jwt with alg', () => {
      const input = `z.jwt({ alg: "HS256" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.jwt({ alg: "HS256" });`);
    });

    it('transforms nanoid', () => {
      const input = `z.nanoid()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.nanoid();`);
    });

    it('transforms cuid', () => {
      const input = `z.cuid()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.cuid();`);
    });

    it('transforms cuid2', () => {
      const input = `z.cuid2()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.cuid2();`);
    });

    it('transforms ulid', () => {
      const input = `z.ulid()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.ulid();`);
    });

    it('transforms ipv4', () => {
      const input = `z.ipv4()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.ipv4();`);
    });

    it('transforms ipv6', () => {
      const input = `z.ipv6()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.ipv6();`);
    });

    it('transforms mac', () => {
      const input = `z.mac()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.mac();`);
    });

    it('transforms mac with delimiter', () => {
      const input = `z.mac({ delimiter: "-" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.mac({ delimiter: "-" });`);
    });

    it('transforms cidrv4', () => {
      const input = `z.cidrv4()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.cidrv4();`);
    });

    it('transforms cidrv6', () => {
      const input = `z.cidrv6()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.cidrv6();`);
    });

    it('transforms hash sha256', () => {
      const input = `z.hash("sha256")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.hash("sha256");`);
    });

    it('transforms hash md5', () => {
      const input = `z.hash("md5")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.hash("md5");`);
    });

    it('transforms hash with encoding', () => {
      const input = `z.hash("sha256", { enc: "base64" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.hash("sha256", { enc: "base64" });`);
    });

    it('transforms iso.date', () => {
      const input = `z.iso.date()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.iso.date();`);
    });

    it('transforms iso.time', () => {
      const input = `z.iso.time()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.iso.time();`);
    });

    it('transforms iso.time with precision', () => {
      const input = `z.iso.time({ precision: 3 })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.iso.time({ precision: 3 });`);
    });

    it('transforms iso.datetime', () => {
      const input = `z.iso.datetime()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.iso.datetime();`);
    });

    it('transforms iso.datetime with options', () => {
      const input = `z.iso.datetime({ offset: true, local: true })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.iso.datetime({ offset: true, local: true });`);
    });

    it('transforms iso.duration', () => {
      const input = `z.iso.duration()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.iso.duration();`);
    });

    it('transforms guid', () => {
      const input = `z.guid()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.guid();`);
    });

    it('transforms stringFormat', () => {
      const input = `z.stringFormat("cool-id", /^cool-[a-z0-9]{95}$/)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.stringFormat("cool-id", /^cool-[a-z0-9]{95}$/);`);
    });

    it('transforms templateLiteral', () => {
      const input = `z.templateLiteral([ "hello, ", z.string(), "!" ])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.templateLiteral(["hello, ", z.string(), "!"]);`);
    });
  });

  describe('number validations', () => {
    it('transforms number().gt', () => {
      const input = `z.number().gt(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.gt(5));`);
    });

    it('transforms number().gte', () => {
      const input = `z.number().gte(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.gte(5));`);
    });

    it('transforms number().min', () => {
      const input = `z.number().min(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.gte(5));`);
    });

    it('transforms number().lt', () => {
      const input = `z.number().lt(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.lt(5));`);
    });

    it('transforms number().lte', () => {
      const input = `z.number().lte(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.lte(5));`);
    });

    it('transforms number().max', () => {
      const input = `z.number().max(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.lte(5));`);
    });

    it('transforms number().positive', () => {
      const input = `z.number().positive()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.positive());`);
    });

    it('transforms number().nonnegative', () => {
      const input = `z.number().nonnegative()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.nonnegative());`);
    });

    it('transforms number().negative', () => {
      const input = `z.number().negative()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.negative());`);
    });

    it('transforms number().nonpositive', () => {
      const input = `z.number().nonpositive()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.nonpositive());`);
    });

    it('transforms number().multipleOf', () => {
      const input = `z.number().multipleOf(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.multipleOf(5));`);
    });

    it('transforms number().step', () => {
      const input = `z.number().step(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().check(z.multipleOf(5));`);
    });

    it('transforms int', () => {
      const input = `z.int()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.int();`);
    });

    it('transforms int32', () => {
      const input = `z.int32()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.int32();`);
    });
  });

  describe('bigint validations', () => {
    it('transforms bigint().gt', () => {
      const input = `z.bigint().gt(5n)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.gt(5n));`);
    });

    it('transforms bigint().gte', () => {
      const input = `z.bigint().gte(5n)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.gte(5n));`);
    });

    it('transforms bigint().lt', () => {
      const input = `z.bigint().lt(5n)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.lt(5n));`);
    });

    it('transforms bigint().lte', () => {
      const input = `z.bigint().lte(5n)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.lte(5n));`);
    });

    it('transforms bigint().positive', () => {
      const input = `z.bigint().positive()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.positive());`);
    });

    it('transforms bigint().nonnegative', () => {
      const input = `z.bigint().nonnegative()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.nonnegative());`);
    });

    it('transforms bigint().negative', () => {
      const input = `z.bigint().negative()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.negative());`);
    });

    it('transforms bigint().nonpositive', () => {
      const input = `z.bigint().nonpositive()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.nonpositive());`);
    });

    it('transforms bigint().multipleOf', () => {
      const input = `z.bigint().multipleOf(5n)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.bigint().check(z.multipleOf(5n));`);
    });
  });

  describe('date validations', () => {
    it('transforms date', () => {
      const input = `z.date()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.date();`);
    });

    it('transforms date().min', () => {
      const input = `z.date().min(new Date("1900-01-01"))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.date().check(z.minLength(new Date("1900-01-01")));`);
    });

    it('transforms date().max', () => {
      const input = `z.date().max(new Date())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.date().check(z.maxLength(new Date()));`);
    });
  });

  describe('enums', () => {
    it('transforms enum', () => {
      const input = `z.enum(["Salmon", "Tuna", "Trout"])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.enum(["Salmon", "Tuna", "Trout"]);`);
    });

    it('transforms enum with as const', () => {
      const input = `const fish = ["Salmon", "Tuna", "Trout"] as const; z.enum(fish)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; const fish = ["Salmon", "Tuna", "Trout"] as const; z.enum(fish);`
      );
    });

    it('transforms enum from object', () => {
      const input = `const Fish = { Salmon: 0, Tuna: 1 }; z.enum(Fish)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; const Fish = { Salmon: 0, Tuna: 1 }; z.enum(Fish);`);
    });

    it('transforms nativeEnum', () => {
      const input = `enum Fish { Salmon = "Salmon", Tuna = "Tuna" }; z.nativeEnum(Fish)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; enum Fish { Salmon = "Salmon", Tuna = "Tuna", } ; z.nativeEnum(Fish);`
      );
    });
  });

  describe('stringbool', () => {
    it('transforms stringbool', () => {
      const input = `z.stringbool()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.stringbool();`);
    });

    it('transforms stringbool with options', () => {
      const input = `z.stringbool({ truthy: ["true"], falsy: ["false"] })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.stringbool({ truthy: ["true"], falsy: ["false"] });`);
    });

    it('transforms stringbool case sensitive', () => {
      const input = `z.stringbool({ case: "sensitive" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.stringbool({ case: "sensitive" });`);
    });
  });

  describe('optional, nullable, nullish', () => {
    it('transforms optional', () => {
      const input = `z.optional(z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.optional(z.string());`);
    });

    it('transforms optional method on schema', () => {
      const input = `z.string().optional()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.optional(z.string());`);
    });

    it('transforms nullable', () => {
      const input = `z.nullable(z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.nullable(z.string());`);
    });

    it('transforms nullable method on schema', () => {
      const input = `z.string().nullable()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.nullable(z.string());`);
    });

    it('transforms nullish', () => {
      const input = `z.nullish(z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.nullish(z.string());`);
    });

    it('transforms nullish method on schema', () => {
      const input = `z.string().nullish()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.nullish(z.string());`);
    });
  });

  describe('objects', () => {
    it('transforms simple object', () => {
      const input = `z.object({ name: z.string(), age: z.number() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.object({ name: z.string(), age: z.number() });`);
    });

    it('transforms object with optional property', () => {
      const input = `z.object({ name: z.string(), age: z.number().optional() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.object({ name: z.string(), age: z.optional(z.number()) });`
      );
    });

    it('transforms object with optional wrapper', () => {
      const input = `z.object({ name: z.string(), age: z.optional(z.number()) })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.object({ name: z.string(), age: z.optional(z.number()) });`
      );
    });

    it('transforms strictObject', () => {
      const input = `z.strictObject({ name: z.string() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.strictObject({ name: z.string() });`);
    });

    it('transforms looseObject', () => {
      const input = `z.looseObject({ name: z.string() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.looseObject({ name: z.string() });`);
    });

    it('transforms object().loose()', () => {
      const input = `z.object({ name: z.string() }).loose()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.looseObject({ name: z.string() });`);
    });

    it('transforms object().strict()', () => {
      const input = `z.object({ name: z.string() }).strict()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.strictObject({ name: z.string() });`);
    });

    it('transforms object().catchall', () => {
      const input = `z.object({ name: z.string() }).catchall(z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.catchall(z.object({ name: z.string() }), z.string());`
      );
    });

    it('transforms object().extend', () => {
      const input = `z.object({ name: z.string() }).extend({ age: z.number() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.extend(z.object({ name: z.string() }), { age: z.number() });`
      );
    });

    it('transforms object().pick', () => {
      const input = `z.object({ name: z.string(), age: z.number() }).pick({ name: true })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.pick(z.object({ name: z.string(), age: z.number() }), { name: true });`
      );
    });

    it('transforms object().omit', () => {
      const input = `z.object({ name: z.string(), age: z.number() }).omit({ age: true })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.omit(z.object({ name: z.string(), age: z.number() }), { age: true });`
      );
    });

    it('transforms object().partial', () => {
      const input = `z.object({ name: z.string(), age: z.number() }).partial()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.partial(z.object({ name: z.string(), age: z.number() }));`
      );
    });

    it('transforms object().partial with keys', () => {
      const input = `z.object({ name: z.string(), age: z.number() }).partial({ age: true })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.partial(z.object({ name: z.string(), age: z.number() }), { age: true });`
      );
    });

    it('transforms object().required', () => {
      const input = `z.object({ name: z.string(), age: z.number().optional() }).required()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.required(z.object({ name: z.string(), age: z.optional(z.number()) }));`
      );
    });

    it('transforms object().required with keys', () => {
      const input = `z.object({ name: z.string().optional(), age: z.number().optional() }).required({ age: true })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.required(z.object({ name: z.optional(z.string()), age: z.optional(z.number()) }), { age: true });`
      );
    });
  });

  describe('arrays', () => {
    it('transforms array', () => {
      const input = `z.array(z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string());`);
    });

    it('transforms array method', () => {
      const input = `z.string().array()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string());`);
    });

    it('transforms array().nonempty', () => {
      const input = `z.array(z.string()).nonempty()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string()).check(z.minLength(1));`);
    });

    it('transforms array().min', () => {
      const input = `z.array(z.string()).min(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string()).check(z.minLength(5));`);
    });

    it('transforms array().max', () => {
      const input = `z.array(z.string()).max(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string()).check(z.maxLength(5));`);
    });

    it('transforms array().length', () => {
      const input = `z.array(z.string()).length(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string()).check(z.length(5));`);
    });

    it('transforms array().nonempty', () => {
      const input = `z.array(z.string()).nonempty()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string()).check(z.minLength(1));`);
    });
  });

  describe('tuples', () => {
    it('transforms tuple', () => {
      const input = `z.tuple([z.string(), z.number(), z.boolean()])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.tuple([z.string(), z.number(), z.boolean()]);`);
    });

    it('transforms tuple with rest', () => {
      const input = `z.tuple([z.string()], z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.tuple([z.string()], z.number());`);
    });
  });

  describe('unions', () => {
    it('transforms union', () => {
      const input = `z.union([z.string(), z.number()])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.union([z.string(), z.number()]);`);
    });

    it('transforms or method', () => {
      const input = `z.string().or(z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.union([z.string(), z.number()]);`);
    });

    it('transforms xor', () => {
      const input = `z.xor([z.string(), z.number()])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.xor([z.string(), z.number()]);`);
    });

    it('transforms discriminatedUnion', () => {
      const input = `z.discriminatedUnion("status", [z.object({ status: z.literal("success"), data: z.string() }), z.object({ status: z.literal("failed"), error: z.string() })])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.discriminatedUnion("status", [z.object({ status: z.literal("success"), data: z.string() }), z.object({ status: z.literal("failed"), error: z.string() })]);`
      );
    });
  });

  describe('intersections', () => {
    it('transforms intersection', () => {
      const input = `z.intersection(z.string(), z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.intersection(z.string(), z.number());`);
    });

    it('transforms and method', () => {
      const input = `z.string().and(z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.intersection(z.string(), z.number());`);
    });
  });

  describe('records', () => {
    it('transforms record', () => {
      const input = `z.record(z.string(), z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.record(z.string(), z.string());`);
    });

    it('transforms record with enum key', () => {
      const input = `z.record(z.enum(["id", "name"]), z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.record(z.enum(["id", "name"]), z.string());`);
    });

    it('transforms record with number key', () => {
      const input = `z.record(z.number(), z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.record(z.number(), z.string());`);
    });

    it('transforms partialRecord', () => {
      const input = `z.partialRecord(z.enum(["id", "name"]), z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.partialRecord(z.enum(["id", "name"]), z.string());`);
    });

    it('transforms looseRecord', () => {
      const input = `z.looseRecord(z.string(), z.string())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.looseRecord(z.string(), z.string());`);
    });
  });

  describe('maps', () => {
    it('transforms map', () => {
      const input = `z.map(z.string(), z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.map(z.string(), z.number());`);
    });
  });

  describe('sets', () => {
    it('transforms set', () => {
      const input = `z.set(z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.set(z.number());`);
    });

    it('transforms set().min', () => {
      const input = `z.set(z.string()).min(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.set(z.string()).check(z.minLength(5));`);
    });

    it('transforms set().max', () => {
      const input = `z.set(z.string()).max(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.set(z.string()).check(z.maxLength(5));`);
    });

    it('transforms set().size', () => {
      const input = `z.set(z.string()).size(5)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.set(z.string()).check(z.size(5));`);
    });
  });

  describe('files', () => {
    it('transforms file', () => {
      const input = `z.file()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.file();`);
    });

    it('transforms file with options', () => {
      const input = `z.file().min(10_000).max(1_000_000).mime("image/png")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.file().min(10_000).max(1_000_000).mime("image/png");`
      );
    });
  });

  describe('promises', () => {
    it('transforms promise', () => {
      const input = `z.promise(z.number())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.promise(z.number());`);
    });
  });

  describe('instanceof', () => {
    it('transforms instanceof', () => {
      const input = `z.instanceof(Date)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.instanceof(Date);`);
    });

    it('transforms instance with property', () => {
      const input = `z.instanceof(URL).check(z.property("protocol", z.literal("https:")))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.instanceof(URL).check(z.property("protocol", z.literal("https:")));`
      );
    });

    it('transforms string with property', () => {
      const input = `z.string().check(z.property("length", z.number().min(10)))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.string().check(z.property("length", z.number().check(z.gte(10))));`
      );
    });
  });

  describe('refinements', () => {
    it('transforms refine', () => {
      const input = `z.string().refine(val => val.length <= 255)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.refine(val => val.length <= 255));`);
    });

    it('transforms refine with error', () => {
      const input = `z.string().refine(val => val.length > 8, { error: "Too short!" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.string().check(z.refine(val => val.length > 8, { error: "Too short!" }));`
      );
    });

    it('transforms refine with abort', () => {
      const input = `z.string().refine(val => val.length > 8, { abort: true })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.string().check(z.refine(val => val.length > 8, { abort: true }));`
      );
    });

    it('transforms refine with path', () => {
      const input = `z.object({ password: z.string(), confirm: z.string() }).refine(data => data.password === data.confirm, { path: ["confirm"] })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.object({ password: z.string(), confirm: z.string() }).check(z.refine(data => data.password === data.confirm, { path: ["confirm"] }));`
      );
    });

    it('transforms superRefine', () => {
      const input = `z.array(z.string()).superRefine((val, ctx) => {})`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.array(z.string()).check(z.superRefine((val, ctx) => {}));`
      );
    });
  });

  describe('transforms and pipes', () => {
    it('transforms transform method', () => {
      const input = `z.string().transform(val => val.toUpperCase())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.pipe(z.string(), z.transform(val => val.toUpperCase()));`
      );
    });

    it('transforms pipe method', () => {
      const input = `z.string().pipe(z.transform(val => val.length))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.pipe(z.string(), z.transform(val => val.length));`);
    });

    it('transforms z.pipe', () => {
      const input = `z.pipe(z.string(), z.transform(val => val.length))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.pipe(z.string(), z.transform(val => val.length));`);
    });

    it('transforms async transform', () => {
      const input = `z.string().transform(async val => val.toUpperCase())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.pipe(z.string(), z.transform(async val => val.toUpperCase()));`
      );
    });

    it('transforms preprocess', () => {
      const input = `z.preprocess((val) => Number.parseInt(String(val)), z.int())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.preprocess(val => Number.parseInt(String(val)), z.int());`
      );
    });
  });

  describe('defaults', () => {
    it('transforms default', () => {
      const input = `z.string().default("tuna")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z._default(z.string(), "tuna");`);
    });

    it('transforms default with function', () => {
      const input = `z.number().default(Math.random)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z._default(z.number(), Math.random);`);
    });
  });

  describe('prefaults', () => {
    it('transforms prefault', () => {
      const input = `z.string().transform(val => val.length).prefault("tuna")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.prefault(z.pipe(z.string(), z.transform(val => val.length)), "tuna");`
      );
    });
  });

  describe('catch', () => {
    it('transforms catch', () => {
      const input = `z.number().catch(42)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.catch(z.number(), 42);`);
    });

    it('transforms catch with function', () => {
      const input = `z.number().catch((ctx) => Math.random())`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.catch(z.number(), ctx => Math.random());`);
    });

    it('transforms object catch', () => {
      const input = `z.object({ name: z.string() }).catch({ name: "default" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.catch(z.object({ name: z.string() }), { name: "default" });`
      );
    });
  });

  describe('branded types', () => {
    it('transforms brand', () => {
      const input = `z.object({ name: z.string() }).brand<"Cat">()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.object({ name: z.string() });`);
    });

    it('transforms brand with direction', () => {
      const input = `z.string().brand<"Cat", "in">()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string();`);
    });
  });

  describe('readonly', () => {
    it('transforms readonly', () => {
      const input = `z.object({ name: z.string() }).readonly()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.readonly(z.object({ name: z.string() }));`);
    });

    it('transforms z.readonly', () => {
      const input = `z.readonly(z.object({ name: z.string() }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.readonly(z.object({ name: z.string() }));`);
    });

    it('transforms array readonly', () => {
      const input = `z.array(z.string()).readonly()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.readonly(z.array(z.string()));`);
    });

    it('transforms tuple readonly', () => {
      const input = `z.tuple([z.string(), z.number()]).readonly()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.readonly(z.tuple([z.string(), z.number()]));`);
    });
  });

  describe('json', () => {
    it('transforms json', () => {
      const input = `z.json()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.json();`);
    });
  });

  describe('functions', () => {
    it('transforms function', () => {
      const input = `z.function({ input: [z.string()], output: z.number() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.function({ input: [z.string()], output: z.number() });`
      );
    });

    it('transforms function without output', () => {
      const input = `z.function({ input: [z.string()] })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.function({ input: [z.string()] });`);
    });
  });

  describe('custom', () => {
    it('transforms custom', () => {
      const input = `z.custom<{ arg: string }>()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.custom<{ arg: string; }>();`);
    });

    it('transforms custom with validator', () => {
      const input = `z.custom<{ arg: string }>((val) => typeof val === "object")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.custom<{ arg: string; }>(val => typeof val === "object");`
      );
    });
  });

  describe('apply', () => {
    it('transforms apply method', () => {
      const input = `z.number().apply(setCommonNumberChecks)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.number().apply(setCommonNumberChecks);`);
    });
  });

  describe('codecs', () => {
    it('transforms codec', () => {
      const input = `z.codec(z.iso.datetime(), z.date(), { decode: (s) => new Date(s), encode: (d) => d.toISOString() })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.codec(z.iso.datetime(), z.date(), { decode: s => new Date(s), encode: d => d.toISOString() });`
      );
    });

    it('transforms invertCodec', () => {
      const input = `z.invertCodec(stringToDate)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.invertCodec(stringToDate);`);
    });
  });

  describe('complex nested schemas', () => {
    it('transforms deeply nested object', () => {
      const input = `z.object({ user: z.object({ profile: z.object({ settings: z.object({ theme: z.string() }) }) }) })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.object({ user: z.object({ profile: z.object({ settings: z.object({ theme: z.string() }) }) }) });`
      );
    });

    it('transforms array of objects', () => {
      const input = `z.array(z.object({ id: z.string(), name: z.string() }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.array(z.object({ id: z.string(), name: z.string() }));`
      );
    });

    it('transforms nested array with validation', () => {
      const input = `z.array(z.array(z.object({ x: z.number(), y: z.number() }))).min(1).max(10)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.array(z.array(z.object({ x: z.number(), y: z.number() }))).check(z.minLength(1), z.maxLength(10));`
      );
    });

    it('transforms union in object', () => {
      const input = `z.object({ value: z.union([z.string(), z.number(), z.boolean()]) })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.object({ value: z.union([z.string(), z.number(), z.boolean()]) });`
      );
    });

    it('transforms discriminated union in object', () => {
      const input = `z.object({ type: z.literal("a"), a: z.string() }).or(z.object({ type: z.literal("b"), b: z.number() }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.union([z.object({ type: z.literal("a"), a: z.string() }), z.object({ type: z.literal("b"), b: z.number() })]);`
      );
    });

    it('transforms record with complex value', () => {
      const input = `z.record(z.string(), z.object({ id: z.string(), value: z.number() }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.record(z.string(), z.object({ id: z.string(), value: z.number() }));`
      );
    });

    it('transforms map with complex types', () => {
      const input = `z.map(z.string(), z.object({ name: z.string(), tags: z.array(z.string()) }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.map(z.string(), z.object({ name: z.string(), tags: z.array(z.string()) }));`
      );
    });

    it('transforms set of objects', () => {
      const input = `z.set(z.object({ id: z.string() }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.set(z.object({ id: z.string() }));`);
    });

    it('transforms tuple with varied types', () => {
      const input = `z.tuple([z.string(), z.number(), z.boolean(), z.array(z.string()), z.object({ x: z.number() })])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.tuple([z.string(), z.number(), z.boolean(), z.array(z.string()), z.object({ x: z.number() })]);`
      );
    });
  });

  describe('chained transformations', () => {
    it('transforms string with multiple checks and wrappers', () => {
      const input = `z.string().min(5).max(100).trim().toLowerCase().optional().nullable()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.nullable(z.optional(z.string().check(z.minLength(5), z.maxLength(100), z.trim(), z.toLowerCase())));`
      );
    });

    it('transforms number with checks and wrappers', () => {
      const input = `z.number().int().positive().min(0).max(100).optional().default(50)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z._default(z.optional(z.number().check(z.int(), z.positive(), z.gte(0), z.lte(100))), 50);`
      );
    });

    it('transforms array with element validation and wrappers', () => {
      const input = `z.array(z.object({ id: z.string().uuid(), name: z.string().min(1) })).min(1).max(100).optional()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.optional(z.array(z.object({ id: z.string().check(z.uuid()), name: z.string().check(z.minLength(1)) })).check(z.minLength(1), z.maxLength(100)));`
      );
    });

    it('transforms object with refinements and transforms', () => {
      const input = `z.object({ name: z.string().min(1), age: z.number().int().positive() }).refine(data => data.age >= 18, { error: "Must be adult" }).transform(data => ({ ...data, isAdult: true }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.pipe(z.object({ name: z.string().check(z.minLength(1)), age: z.number().check(z.int(), z.positive()) }).check(z.refine(data => data.age >= 18, { error: "Must be adult" })), z.transform(data => ({ ...data, isAdult: true })));`
      );
    });

    it('transforms complex union with transforms', () => {
      const input = `z.union([z.object({ type: z.literal("user"), name: z.string() }), z.object({ type: z.literal("admin"), roles: z.array(z.string()) })]).transform(data => ({ ...data, processed: true }))`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; z.pipe(z.union([z.object({ type: z.literal("user"), name: z.string() }), z.object({ type: z.literal("admin"), roles: z.array(z.string()) })]), z.transform(data => ({ ...data, processed: true })));`
      );
    });
  });

  describe('recursive schemas', () => {
    it('transforms self-referential object using getter', () => {
      const input = `const Category = z.object({ name: z.string(), get subcategories() { return z.array(Category) } })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; const Category = z.object({ name: z.string(), get subcategories() { return z.array(Category); } });`
      );
    });
  });

  describe('edge cases', () => {
    it('transforms empty union', () => {
      const input = `z.union([])`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.union([]);`);
    });

    it('transforms empty object', () => {
      const input = `z.object({})`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.object({});`);
    });

    it('transforms empty array', () => {
      const input = `z.array(z.string()).length(0)`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.array(z.string()).check(z.length(0));`);
    });

    it('transforms schema variable usage', () => {
      const input = `const mySchema = z.string().min(5); const usage = mySchema.optional()`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; const mySchema = z.string().check(z.minLength(5)); const usage = z.optional(mySchema);`
      );
    });

    it('transforms nested schema variable', () => {
      const input = `const inner = z.object({ x: z.string() }); const outer = z.object({ inner: inner })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(
        `import { z } from "zod/mini"; const inner = z.object({ x: z.string() }); const outer = z.object({ inner: inner });`
      );
    });

    it('transforms schema with describe', () => {
      const input = `z.string().describe("A username")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.describe("A username"));`);
    });

    it('transforms schema with meta', () => {
      const input = `z.string().meta({ key: "value" })`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.meta({ key: "value" }));`);
    });
  });

  describe('describe', () => {
    it('transforms describe', () => {
      const input = `z.string().describe("A name")`;
      const output = transformZodSnippet(input);
      expectCode(output).toEqual(`import { z } from "zod/mini"; z.string().check(z.describe("A name"));`);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { transformZodToMini } from '../src/lib/transform';
import { expectCode } from './codeExpect';

const transformZodSnippet = (code: string) => transformZodToMini(`import { z } from 'zod';\n${code}`);

describe('transformZodToMini', () => {
  it('does not transform z-shaped chains without a zod import', () => {
    const input = `const schema = z.string().min(5).optional();`;
    const output = transformZodToMini(input);
    expect(output).toBe(input);
  });

  it('does not transform z-shaped chains from non-zod imports', () => {
    const input = `import { z } from './local-z';\nconst schema = z.string().min(5).optional();`;
    const output = transformZodToMini(input);
    expect(output).toBe(input);
  });

  it('transforms when z is imported from zod', () => {
    const input = `import { z } from 'zod';\nconst schema = z.string().min(5).optional();`;
    const output = transformZodToMini(input);
    expectCode(output).toContain(`import { z } from "zod/mini";`);
    expectCode(output).toContain(`const schema = z.optional(z.string().check(z.minLength(5)));`);
  });

  it('transforms when z is the default import from zod', () => {
    const input = `import z from 'zod';\nconst schema = z.string().min(5).optional();`;
    const output = transformZodToMini(input);
    expectCode(output).toContain(`import { z } from "zod/mini";`);
    expectCode(output).toContain(`const schema = z.optional(z.string().check(z.minLength(5)));`);
  });

  it('transforms when z is a namespace import from zod', () => {
    const input = `import * as z from 'zod';\nconst schema = z.string().min(5).optional();`;
    const output = transformZodToMini(input);
    expectCode(output).toContain(`import * as z from "zod/mini";`);
    expectCode(output).toContain(`const schema = z.optional(z.string().check(z.minLength(5)));`);
  });

  it('does not transform files already importing zod/mini', () => {
    const input = `import { z } from 'zod/mini';\nconst schema = z.string().check(z.min(5));`;
    const output = transformZodToMini(input);
    expect(output).toBe(input);
  });

  it('transforms optional + nullable chain', () => {
    const input = `const mySchema = z.string().optional().nullable();`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.nullable(z.optional(z.string()))`);
  });

  it('transforms check methods (min, max, trim)', () => {
    const input = `z.string().min(5).max(10).trim()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.string().check(z.minLength(5), z.maxLength(10), z.trim())`);
  });

  it('leaves plain z calls unchanged', () => {
    const input = `const schema = z.string();`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`const schema = z.string();`);
  });

  it('handles object with optional', () => {
    const input = `const schema = z.object({ name: z.string() }).optional();`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.optional(z.object({ name: z.string() }))`);
  });

  it('transforms loose and strict object modes', () => {
    const input = `const fileSchema = z
  .object({
    type: z.literal('file'),
    filename: z.string().endsWith('.svg'),
    mimetype: z.literal('image/svg+xml'),
  })
  .loose();
const strictFileSchema = z.object({ type: z.literal('file') }).strict();`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `const fileSchema = z.looseObject({ type: z.literal('file'), filename: z.string().check(z.endsWith('.svg')), mimetype: z.literal('image/svg+xml') });`
    );
    expectCode(output).toContain(`const strictFileSchema = z.strictObject({ type: z.literal('file') });`);
  });

  it('transforms number with int and min/max', () => {
    const input = `z.number().int().min(0).max(100)`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.number().check(z.int(), z.gte(0), z.lte(100))`);
  });

  it('handles nested schemas', () => {
    const input = `z.object({ id: z.string().uuid(), age: z.number().min(18).optional() })`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.object({ id: z.string().check(z.uuid()), age: z.optional(z.number().check(z.gte(18))) })`
    );
  });

  it('transforms refine method', () => {
    const input = `z.string().min(5).max(10).refine(val => val.includes("@")).trim()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.string().check(z.minLength(5), z.maxLength(10), z.refine(val => val.includes("@")), z.trim());`
    );
  });

  it('transforms transform method', () => {
    const input = `z.string().transform(val => val.toUpperCase())`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.pipe(z.string(), z.transform(val => val.toUpperCase()))`);
  });

  it('preserves transform and wrapper chaining order', () => {
    const input = `z.string().trim().transform(val => val.toUpperCase()).optional().nullable()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.nullable(z.optional(z.pipe(z.string().check(z.trim()), z.transform(val => val.toUpperCase()))))`
    );
  });

  it('handles chained string checks with refine', () => {
    const input = `z.string().email().min(5).refine(val => val.endsWith(".com")).toLowerCase()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.email(z.string()).check(z.minLength(5), z.refine(val => val.endsWith(".com")), z.toLowerCase())`
    );
  });

  it('handles coerce, checks, wrappers, and parse chaining', () => {
    const input = `z.coerce.number<number>().int().positive().optional().parse("42")`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.optional(z.coerce.number().check(z.int(), z.positive())).parse("42")`);
  });

  it('handles nested array and object chains', () => {
    const input = `z.array(z.object({ id: z.string().uuid().optional() })).min(1).nullable()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.nullable(z.array(z.object({ id: z.optional(z.string().check(z.uuid())) })).check(z.minLength(1)))`
    );
  });

  it('handles z.iso.date', () => {
    const input = `z.iso.date()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.iso.date()`);
  });

  it('transforms wrappers after z.iso.date', () => {
    const input = `z.iso.date().transform((value) => startOfDay(value))`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.pipe(z.iso.date(), z.transform(value => startOfDay(value)))`);
  });

  it('handles z.coerce.number().int().positive()', () => {
    const input = `z.coerce.number().int().positive().parse(10)`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.coerce.number().check(z.int(), z.positive()).parse(10)`);
  });

  it('handles coerce with type parameter', () => {
    const input = `z.coerce.number<number>().int().positive()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.coerce.number().check(z.int(), z.positive())`);
  });

  it('transforms default on schema variables', () => {
    const input = `const portSchema = z.coerce.number().int().gte(3000).positive();
const env = z.object({ port: portSchema.default(4000) });`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`const portSchema = z.coerce.number().check(z.int(), z.gte(3000), z.positive());`);
    expectCode(output).toContain(`const env = z.object({ port: z._default(portSchema, 4000) });`);
  });

  it('transforms optional on imported schema variables', () => {
    const input = `import { translationValue } from './translation';
export const baseImageSchema = z.object({
  fileName: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  color: z.string().nullable(),
  description: translationValue.optional(),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`description: z.optional(translationValue)`);
  });

  it('transforms wrappers on imported domain-named variables inside schema definitions', () => {
    const input = `import { accommodationPerformance, performanceDistribution } from './performance';

const accommodationInsights = z.object({
  performance: z.object({
    accommodation: accommodationPerformance.nullable(),
    distribution: performanceDistribution.optional(),
  }),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`accommodation: z.nullable(accommodationPerformance)`);
    expectCode(output).toContain(`distribution: z.optional(performanceDistribution)`);
  });

  it('transforms transform on schema variables', () => {
    const input = `const order = z.object({
  vacationDate: dateOrString.transform((date) => getISODate(date)),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`vacationDate: z.pipe(dateOrString, z.transform(date => getISODate(date)))`);
  });

  it('transforms or chains and extend on schema variables', () => {
    const input = `const messageResponse = z.object({
  message: z.string().or(z.array(z.string())),
});

const test = messageResponse.extend(z.object({ id: z.number() }));`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`message: z.union([z.string(), z.array(z.string())])`);
    expectCode(output).toContain(`const test = z.extend(messageResponse, { id: z.number() });`);
  });

  it('transforms schema variable extend inside helper functions', () => {
    const input = `const messageResponse = z.object({
  message: z.string().or(z.array(z.string())),
});
function withMessage<T extends Record<string, z.ZodType>>(schema: T) {
  return messageResponse.extend(schema);
}`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`message: z.union([z.string(), z.array(z.string())])`);
    expectCode(output).toContain(`return z.extend(messageResponse, schema);`);
  });

  it('transforms extend on domain-named schema variables declared in the file', () => {
    const input = `export const dynamicPolicyAddRequest = z.object({
  nameKey: z.object({
    type: z.literal('field'),
    mimetype: z.literal('text/plain'),
    value: z.string(),
  }),
  iconFile: z
    .object({
      type: z.literal('file'),
      filename: z.string().endsWith('.svg'),
      mimetype: z.literal('image/svg+xml'),
    })
    .loose()
    .optional(),
});

export const dynamicPolicyEditRequest = dynamicPolicyAddRequest.extend({
  id: z.object({ type: z.literal('field'), mimetype: z.literal('text/plain'), value: idValue }),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `iconFile: z.optional(z.looseObject({ type: z.literal('file'), filename: z.string().check(z.endsWith('.svg')), mimetype: z.literal('image/svg+xml') }))`
    );
    expectCode(output).toContain(
      `export const dynamicPolicyEditRequest = z.extend(dynamicPolicyAddRequest, { id: z.object({ type: z.literal('field'), mimetype: z.literal('text/plain'), value: idValue }) });`
    );
  });

  it('transforms loose and strict on object schema variables', () => {
    const input = `export const UserSchema = z.object({
  name: z.string().min(2).max(50),
  email: EmailSchema,
  age: z.number().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "guest"]).default("guest"),
});

export const AdminSchema = UserSchema.extend({
  role: z.literal("admin"),
}).loose();

export const LockedUserSchema = UserSchema.strict();`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `export const AdminSchema = z.looseObject(z.extend(UserSchema, { role: z.literal("admin") }).shape);`
    );
    expectCode(output).toContain(`export const LockedUserSchema = z.strictObject(UserSchema.shape);`);
  });

  it('transforms and chains on schema variables', () => {
    const input = `const messageSchema = baseMessageSchema.and(
  z.union([
    textMessageTypeSchema,
    buttonMessageTypeSchema,
    imageMessageTypeSchema,
    videoMessageTypeSchema,
    documentMessageTypeSchema,
    unknownMessageTypeSchema,
  ])
);`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `const messageSchema = z.intersection(baseMessageSchema, z.union([textMessageTypeSchema, buttonMessageTypeSchema, imageMessageTypeSchema, videoMessageTypeSchema, documentMessageTypeSchema, unknownMessageTypeSchema]));`
    );
  });

  it('transforms ip format unions with optional wrappers', () => {
    const input = `const schema = z.object({
  ip: z.ipv4().or(z.ipv6()).optional(),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`ip: z.optional(z.union([z.ipv4(), z.ipv6()]))`);
  });

  it('transforms or and nullish on schema variables', () => {
    const input = `const customerSchema = z.object({
  id: idValue.or(z.literal(0)),
  title: z.enum(PersonTitle),
  fullname: z
    .string()
    .regex(/^.+ .+/)
    .trim(),
  email: emailValueSchema,
  phone: phoneValueSchema,
  fax: phoneValueSchema.or(z.literal('')).nullish(),
  personId: personIdSchema.or(z.literal('')),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`id: z.union([idValue, z.literal(0)])`);
    expectCode(output).toContain(`fax: z.nullish(z.union([phoneValueSchema, z.literal('')]))`);
    expectCode(output).toContain(`personId: z.union([personIdSchema, z.literal('')])`);
  });

  it('transforms partial on schema variables', () => {
    const input = `const customerSchema = z.object({
  ...phoneValueSchema.partial().shape,
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.object({ ...z.partial(phoneValueSchema).shape })`);
  });

  it('transforms partial on schema variables in nested object', () => {
    const input = `const businessSchema = z.object({
  name: z.string(),
});
const priceQuotesSchema = z.object({
id: z.string(),
  business: z.object({ id: idValue.or(z.literal(0)), ...businessSchema.partial().shape }),
});`;
    const output = transformZodSnippet(input);

    expectCode(output).toContain(
      `business: z.object({ id: z.union([idValue, z.literal(0)]), ...z.partial(businessSchema).shape })`
    );
  });

  it('transforms partial shape spreads from refined object schemas', () => {
    const input = `const businessSchema = z.object({
  name: z.string(),
  vatId: z.string().refine((value) => isValidIsraeliID(value), { message: 'VAT.ID' }),
  settlement: z.string(),
  streetName: z.string(),
  streetNumber: z.string(),
  postalCode: z.string(),
  dutyFree: z.boolean(),
});

const priceQuotesSchema = z.object({
  business: z.object({ id: idValue.or(z.literal(0)), ...businessSchema.partial().shape }),
});`;
    const output = transformZodSnippet(input);

    expectCode(output).toContain(
      `vatId: z.string().check(z.refine(value => isValidIsraeliID(value), { message: 'VAT.ID' }))`
    );
    expectCode(output).toContain(
      `business: z.object({ id: z.union([idValue, z.literal(0)]), ...z.partial(businessSchema).shape })`
    );
  });

  it('keeps partial before object-level refinements', () => {
    const input = `const promotedCategoryAddRequest = z.object({
  queryParams: z
    .object({
      checkin: z.iso
        .date()
        .refine((date) => isAfter(date, startOfDay(new Date())), { error: 'ERROR.CHECKIN_DATE.MIN_TODAY' }),
      checkout: z.iso
        .date()
        .refine((date) => isAfter(date, startOfDay(new Date())), { error: 'ERROR.CHECKOUT_DATE.MIN_TODAY' }),
      adults: z.number().int().min(0).max(100),
      children: z.number().int().min(0).max(100),
      infants: z.number().int().min(0).max(100),
      bedrooms: z.number().int().min(0).max(100),
    })
    .partial()
    .refine((value) => !(!!value.checkin && !value.checkout), { error: 'PROMOTED_CATEGORIES.ERROR.CHECKOUT_REQUIRED' })
    .refine((value) => !(!value.checkin && !!value.checkout), { error: 'PROMOTED_CATEGORIES.ERROR.CHECKIN_REQUIRED' })
    .transform((value) =>
      Object.fromEntries(
        Object.entries(value || {}).filter(([key, value]) => {
          if (key !== 'checkin' && key !== 'checkout') return typeof value === 'number' && value > 0;
          return true;
        })
      )
    )
    .optional(),
});`;
    const output = transformZodSnippet(input);

    expectCode(output).toContain(`z.optional(z.pipe(z.partial(z.object({`);
    expectCode(output).toContain(
      `z.pipe(z.partial(z.object({ checkin: z.iso.date().check(z.refine(date => isAfter(date, startOfDay(new Date())), { error: 'ERROR.CHECKIN_DATE.MIN_TODAY' })), checkout: z.iso.date().check(z.refine(date => isAfter(date, startOfDay(new Date())), { error: 'ERROR.CHECKOUT_DATE.MIN_TODAY' })), adults: z.number().check(z.int(), z.gte(0), z.lte(100)), children: z.number().check(z.int(), z.gte(0), z.lte(100)), infants: z.number().check(z.int(), z.gte(0), z.lte(100)), bedrooms: z.number().check(z.int(), z.gte(0), z.lte(100)) })).check(z.refine(value => !(!!value.checkin && !value.checkout), { error: 'PROMOTED_CATEGORIES.ERROR.CHECKOUT_REQUIRED' }), z.refine(value => !(!value.checkin && !!value.checkout), { error: 'PROMOTED_CATEGORIES.ERROR.CHECKIN_REQUIRED' })), z.transform(value => Object.fromEntries(Object.entries(value || {}).filter(([key, value]) => {`
    );
    expectCode(output).notToContain(`}).check(z.refine(value => !(!!value.checkin && !value.checkout)`);

    const simpleOutput = transformZodSnippet(
      `const schema = z.object({ a: z.string() }).partial().refine((value) => value.a).optional();`
    );
    expectCode(simpleOutput).toContain(
      `z.optional(z.partial(z.object({ a: z.string() })).check(z.refine(value => value.a)))`
    );
    expectCode(simpleOutput).notToContain(`z.optional(z.partial(z.object({ a: z.string() }).check`);
  });

  it('transforms omit and pick on schema variables', () => {
    const input = `const imageWithoutDescription = baseImageSchema
  .omit({ description: true })
  .refine((value) => value?.fileName.startsWith(\`\${env.CLD_FOLDER}/system-messages/\`), {
    error: 'ERROR.IMAGE_FILENAME.STARTS_WITH',
  })
  .nullable();
const imageIdentity = baseImageSchema.pick({ fileName: true });`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `const imageWithoutDescription = z.nullable(z.omit(baseImageSchema, { description: true }).check(z.refine(value => value?.fileName.startsWith(\`\${env.CLD_FOLDER}/system-messages/\`), { error: 'ERROR.IMAGE_FILENAME.STARTS_WITH' })));`
    );
    expectCode(output).toContain(`const imageIdentity = z.pick(baseImageSchema, { fileName: true });`);
  });

  it('transforms default after optional checked coerce chains', () => {
    const input = `const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
});`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `const paginationQuerySchema = z.object({ page: z._default(z.optional(z.coerce.number().check(z.gte(1))), 1) });`
    );
  });

  it('transforms stringbool with optional and default wrappers', () => {
    const input = `const schema = z.stringbool().optional().default(false);`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`const schema = z._default(z.optional(z.stringbool()), false);`);
  });

  it('uses functional pipe after default wrappers', () => {
    const input = `const schema = z.string().default("x").transform((value) => value.trim());`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `const schema = z.pipe(z._default(z.string(), "x"), z.transform(value => value.trim()));`
    );
    expectCode(output).notToContain(`._default(z.string(), "x").pipe`);
  });

  it('transforms catch after object refinements', () => {
    const input = `const datesSchema = z
  .object({
    checkin: z.iso
      .date()
      .transform((date) => new Date(date))
      .refine((value) => isAfter(value, startOfDay(new Date())), { error: 'ERROR.CHECKIN.MIN_DATE' })
      .optional(),
    checkout: z.iso
      .date()
      .transform((date) => new Date(date))
      .optional(),
  })
  .refine(
    ({ checkin, checkout }) => {
      if (!!checkin && !!checkout) {
        return isAfter(checkout, checkin);
      }

      return [!!checkin, !!checkout].filter(Boolean).length === 1;
    },
    { error: 'ERROR.CHECKOUT.MIN_DATE' }
  )
  .catch({ checkin: undefined, checkout: undefined });`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `checkin: z.optional(z.pipe(z.iso.date(), z.transform(date => new Date(date))).check(z.refine(value => isAfter(value, startOfDay(new Date())), { error: 'ERROR.CHECKIN.MIN_DATE' })))`
    );
    expectCode(output).toContain(`checkout: z.optional(z.pipe(z.iso.date(), z.transform(date => new Date(date))))`);
    expectCode(output).toContain(`z.catch(z.object({`);
    expectCode(output).toContain(`}).check(z.refine(({ checkin, checkout }) => {`);
    expectCode(output).toContain(
      `{ error: 'ERROR.CHECKOUT.MIN_DATE' })), { checkin: undefined, checkout: undefined })`
    );
  });

  it('transforms numeric comparison and multiple checks', () => {
    const input = `z.number().gt(0).gte(1).lt(10).lte(9).multipleOf(3).nonnegative()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.number().check(z.gt(0), z.gte(1), z.lt(10), z.lte(9), z.multipleOf(3), z.nonnegative())`
    );
  });

  it('transforms number min and max to numeric checks', () => {
    const input = `z.number().int().min(800).max(20000)`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.number().check(z.int(), z.gte(800), z.lte(20000))`);
    expectCode(output).notToContain(`z.minLength(800)`);
    expectCode(output).notToContain(`z.maxLength(20000)`);
  });

  it('transforms collection size checks', () => {
    const input = `z.array(z.string()).minSize(1).maxSize(5).size(3)`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.array(z.string()).check(z.minSize(1), z.maxSize(5), z.size(3))`);
  });

  it('transforms string checks and mutations from mini docs', () => {
    const input = `z.string().regex(/^[a-z]+$/).lowercase().includes("a").startsWith("a").endsWith("z").normalize().toUpperCase()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.string().check(z.regex(/^[a-z]+$/), z.lowercase(), z.includes("a"), z.startsWith("a"), z.endsWith("z"), z.normalize(), z.toUpperCase())`
    );
  });

  it('transforms metadata and custom check aliases', () => {
    const input = `z.string().superRefine((val, ctx) => {}).overwrite(val => val.trim()).meta({ title: "Name" }).describe("A name")`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `z.string().check(z.superRefine((val, ctx) => {}), z.overwrite(val => val.trim()), z.meta({ title: "Name" }), z.describe("A name"))`
    );
  });

  it('transforms superRefine with addIssue callbacks', () => {
    const input = `const chatMessage = z
  .object({
    id: z.number(),
    content: z.string().optional(),
    status: z.enum(chatMessageStatus),
    createdAt: z.coerce.date(),
    template: chatMessageTemplate,
    senderId: idValue,
    media: z.array(chatMessageMedia),
  })
  .superRefine((val, ctx) => {
    if (!val.content && val.media.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'CHAT.INVALID_CONTENT',
      });
    }
  });`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`}).check(z.superRefine((val, ctx) => {`);
    expectCode(output).toContain(`ctx.addIssue({ code: 'custom', message: 'CHAT.INVALID_CONTENT' });`);
    expectCode(output).notToContain(`z.check((val, ctx) =>`);
  });

  it('transforms email checks and mutations from mini docs', () => {
    const input = `z.email().trim().toLowerCase()`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.email().check(z.trim(), z.toLowerCase())`);
  });

  it('transforms prefault after transforms', () => {
    const input = `z.string().transform(val => val.length).prefault("tuna")`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(`z.prefault(z.pipe(z.string(), z.transform(val => val.length)), "tuna")`);
  });

  it('throws on unsupported zod chain methods', () => {
    expect(() => transformZodSnippet(`z.string().madeUpZodMethod()`)).toThrow(
      `Unsupported Zod method "madeUpZodMethod" in zod-mini-transform`
    );
  });

  it('includes filename when throwing on unsupported zod chain methods', () => {
    expect(() =>
      transformZodToMini(`import { z } from 'zod';\nz.string().madeUpZodMethod()`, {
        filename: '/app/src/schema.ts',
      })
    ).toThrow(`Unsupported Zod method "madeUpZodMethod" in zod-mini-transform while processing /app/src/schema.ts`);
  });

  it('throws on unsupported methods in schema variable wrapper chains', () => {
    expect(() => transformZodSnippet(`const schema = baseSchema.madeUpZodMethod().optional();`)).toThrow(
      `Unsupported Zod method "madeUpZodMethod" in zod-mini-transform`
    );
  });

  it('does not throw on unrelated method calls', () => {
    const output = transformZodSnippet(`instance.withTypeProvider<ZodTypeProvider>().get(
    '/test',
    {
      schema: {
        querystring: z.object({
          title: z.string(),
          type: z.string(),
        }),
      },
    },
    async ({ query }) => {
      const articleOptions = await db
        .insert(insertData)
        .into(tableNames.articles)
        .catch((err) => {
          if (err.code === 'ER_DUP_ENTRY') {
            throw new ApiError('ARTICLES.FORM.ERROR.DUPLICATE_SLUG', 409);
          }
          return [];
        });

      
      return articleOptions.map((tag) => ({ value: tag, text: tag }));
    }
  );`);
    expectCode(output).toContain(`instance.withTypeProvider<ZodTypeProvider>().get`);
    expectCode(output).toContain(`querystring: z.object({ title: z.string(), type: z.string() })`);
    expectCode(output).toContain(`.catch(err => {`);
  });

  it('transforms discriminatedUnion checks and mutations from mini docs', () => {
    const input = `const mealSchema = z
  .discriminatedUnion('isIncluded', [
    z.object({ isIncluded: z.literal('INCLUDED_IN_PRICE') }),
    z.object({
      isIncluded: z.literal('NOT_INCLUDED_IN_PRICE'),
      adultPrice: z.coerce.number(),
      childPrice: z.coerce.number(),
    }),
    z.object({ isIncluded: z.literal('NOT_INCLUDED_IN_PRICE_PRICES_UNKNOWN') }),
  ])
  .transform((value) => ({ ...value, isIncluded: +value.isIncluded }))`;
    const output = transformZodSnippet(input);
    expectCode(output).toContain(
      `const mealSchema = z.pipe(z.discriminatedUnion('isIncluded', [z.object({ isIncluded: z.literal('INCLUDED_IN_PRICE') }), z.object({ isIncluded: z.literal('NOT_INCLUDED_IN_PRICE'), adultPrice: z.coerce.number(), childPrice: z.coerce.number() }), z.object({ isIncluded: z.literal('NOT_INCLUDED_IN_PRICE_PRICES_UNKNOWN') })]), z.transform(value => ({ ...value, isIncluded: +value.isIncluded })));`
    );
  });

  it('does not treat property chains inside refine callbacks as zod chains', () => {
    const output = transformZodSnippet(`z.object({
  categoryIds: z.array(idValue).min(1),
  image: baseImageSchema
    .refine(
      (value) => value.fileName.includes('/promoted-categories/'),
      {
        error: 'ERROR.IMAGE_FILENAME_NOT_VALID',
      }
    )
    .nullable(),
    });`);
    expectCode(output).toContain(`categoryIds: z.array(idValue).check(z.minLength(1))`);
    expectCode(output).toContain(
      `image: z.nullable(baseImageSchema.check(z.refine(value => value.fileName.includes('/promoted-categories/'), { error: 'ERROR.IMAGE_FILENAME_NOT_VALID' })))`
    );
  });
});

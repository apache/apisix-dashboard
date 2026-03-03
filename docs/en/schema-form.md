# SchemaForm — Developer Guide

This document describes how the `SchemaForm` component works, how to extend
the schema-to-widget mapping, and the conventions used to support APISIX
plugin schemas.

---

## Overview

`SchemaForm` converts a [JSON Schema Draft 7][json-schema-draft7] object into
a fully controlled React form.  It composes the existing dashboard form
primitives (`FormItemTextInput`, `FormItemSelect`, etc.) with
[react-hook-form][rhf] for state management and [AJV][ajv] for validation.

```
JSON Schema
    │
    ▼
SchemaForm            — top-level orchestrator
    │
    ├─ SchemaField    — maps a single schema node → widget
    ├─ ArrayField     — dynamic list of items (useFieldArray)
    ├─ OneOfFields    — conditional branch via discriminator
    ├─ AnyOfFields    — conditional branch via discriminator (same as oneOf)
    └─ IfThenElseFields — Draft-7 if/then/else conditional
```

---

## File structure

```
src/components/form/SchemaForm/
├── index.tsx          SchemaForm + conditional sub-components
├── SchemaField.tsx    Maps a JSON Schema node → a form widget
├── ArrayField.tsx     Renders an array of objects with add/remove
├── types.ts           JSONSchema7 TypeScript interface
└── validation.ts      AJV instance, validateWithSchema, createSchemaResolver
```

---

## Supported schema keywords

| Keyword | Rendered as |
|---|---|
| `type: "string"` | `FormItemTextInput` (text) |
| `type: "string"` + in `encrypt_fields` | `FormItemPasswordInput` (masked) |
| `type: "number"` / `"integer"` | `FormItemNumberInput` |
| `type: "boolean"` | `FormItemSwitch` |
| `enum` | `FormItemSelect` (dropdown) |
| `type: "array"`, items `string`/`number` | `FormItemTextArray` (Mantine TagsInput) |
| `type: "array"`, items `object` | `ArrayField` (dynamic rows with add/remove) |
| `type: "object"` with `properties` | Nested `Fieldset` + recursive `SchemaField` |
| `oneOf` | `OneOfFields` — discriminator-based branch switcher |
| `anyOf` | `AnyOfFields` — same pattern as oneOf |
| `dependencies` | `DependencyFields` — shows extra fields when a sibling has a value |
| `if` / `then` / `else` | `IfThenElseFields` — AJV-evaluated conditional |

Constraints surfaced to the UI:

| Schema keyword | Effect |
|---|---|
| `required` | Marks field with asterisk; validated server-side via AJV |
| `minimum` / `maximum` | Passed to `NumberInput` min/max props |
| `minLength` / `maxLength` | Validated by AJV; error shown below input |
| `pattern` | Validated by AJV; "Invalid format" error shown |
| `default` | Shown as placeholder text |
| `title` | Used as the field label (falls back to formatted field name) |
| `description` | Rendered as helper text below the input |
| `encrypt_fields` | APISIX extension — renders those fields as password inputs |

---

## Basic usage

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { SchemaForm, createSchemaResolver } from '@/components/form/SchemaForm';
import type { JSONSchema7 } from '@/components/form/SchemaForm/types';

const schema: JSONSchema7 = {
    type: 'object',
    properties: {
        host: { type: 'string', title: 'Host' },
        port: { type: 'integer', title: 'Port', minimum: 1, maximum: 65535, default: 6379 },
    },
    required: ['host'],
};

function MyForm() {
    const methods = useForm({
        resolver: createSchemaResolver(schema),  // wire AJV validation
        defaultValues: { host: '', port: 6379 },
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(console.log)}>
                <SchemaForm schema={schema} />
                <button type="submit">Save</button>
            </form>
        </FormProvider>
    );
}
```

### Using `basePath` for nested plugin configs

When the form manages a larger document (e.g. all plugin configs), pass
`basePath` so field names are correctly prefixed:

```tsx
<SchemaForm schema={pluginSchema} basePath="plugins.proxy-rewrite" />
// field "uri" becomes "plugins.proxy-rewrite.uri" in RHF
```

---

## How schema-to-widget mapping works

`SchemaField` runs through a priority-ordered decision tree:

```
1. type === 'object' && properties  → Fieldset + recurse
2. type === 'array'  && items       → string/number items → TagsInput
                                     object items         → ArrayField
3. enum present                     → Select
4. type === 'boolean'               → Switch
5. type === 'number' | 'integer'    → NumberInput
6. isEncrypted (encrypt_fields)     → PasswordInput
7. (default)                        → TextInput
```

---

## Adding a new widget type

**Step 1 — Create (or reuse) a Mantine-backed form component** in
`src/components/form/`.  Follow the existing pattern using `genControllerProps`
+ `useController`:

```tsx
export const FormItemMyWidget = <T extends FieldValues>(props: ...) => {
    const { controllerProps, restProps } = genControllerProps(props, defaultVal);
    const { field, fieldState } = useController<T>(controllerProps);
    return <MyMantineWidget error={fieldState.error?.message} {...field} />;
};
```

**Step 2 — Add a detection branch in `SchemaField.tsx`**:

```tsx
// Example: render a Slider for schemas with x-widget: "slider"
if ((schema as JSONSchema7 & { 'x-widget'?: string })['x-widget'] === 'slider') {
    return (
        <FormItemSlider
            name={name}
            control={control}
            label={schema.title || formatLabel(name)}
            min={schema.minimum}
            max={schema.maximum}
        />
    );
}
```

The branch can match on any schema property: `type`, `format`, `x-widget`
(custom extension), field name patterns, etc.

**Step 3 — Document the mapping** in the table above.

---

## Conditional field patterns

### `oneOf` and `anyOf` — discriminator pattern

Both `oneOf` and `anyOf` are rendered identically: the component finds a
property whose value is a `const` (the discriminator), watches that field, and
renders the branch whose `const` matches the current value.

```json
{
  "properties": { "type": { "type": "string", "enum": ["a", "b"] } },
  "oneOf": [
    { "properties": { "type": { "const": "a" }, "field_a": { "type": "string" } } },
    { "properties": { "type": { "const": "b" }, "field_b": { "type": "integer" } } }
  ]
}
```

The discriminator field itself **must appear in `properties`** (not only inside
the `oneOf` branches) so it is always rendered.

### `dependencies` — sibling-triggered conditional

```json
{
  "properties": { "enable_tls": { "type": "boolean" } },
  "dependencies": {
    "enable_tls": {
      "properties": { "ssl_cert": { "type": "string" } },
      "required": ["ssl_cert"]
    }
  }
}
```

The dependent fields appear when the triggering field has any truthy value.

### `if` / `then` / `else` — AJV-evaluated condition

```json
{
  "if":   { "properties": { "enable": { "const": true } }, "required": ["enable"] },
  "then": { "properties": { "interval": { "type": "integer" } }, "required": ["interval"] },
  "else": {}
}
```

The `if` schema is compiled and evaluated by AJV against the current form
values each time a relevant field changes.  `then` fields are shown on match,
`else` fields on mismatch. Either branch may be omitted.

---

## Validation

`createSchemaResolver(schema)` returns a react-hook-form async resolver backed
by AJV.  Pass it to `useForm`:

```tsx
const methods = useForm({ resolver: createSchemaResolver(schema) });
```

AJV errors are mapped to RHF's `FieldErrors` format:

- **Path conversion**: AJV JSON Pointer `/headers/add/0/name` → RHF dot path
  `headers.add.0.name`
- **Human-readable messages**: "is required", "must be at least N characters",
  "must be one of: GET, POST, …", etc.

For programmatic validation (outside a form), use `validateWithSchema` directly:

```tsx
import { validateWithSchema } from '@/components/form/SchemaForm/validation';

const { isValid, errors } = validateWithSchema(schema, formData);
```

---

## Testing

Run all SchemaForm unit tests:

```bash
pnpm test
```

With live re-run on file changes:

```bash
pnpm test:watch
```

Coverage report (outputs to `coverage/`):

```bash
pnpm test:coverage
```

The tests cover:

| File | What is tested |
|---|---|
| `validation.test.ts` | `validateWithSchema` for all constraint types; `createSchemaResolver` happy/error paths |
| `SchemaField.test.tsx` | Each type mapping (string → TextInput, bool → Switch, enum → Select, etc.); label formatting; nested objects; arrays |
| `SchemaForm.test.tsx` | Top-level property rendering; `oneOf` / `anyOf` branch switching; `dependencies`; `if/then/else`; `basePath`; interactive user interaction |

---

## Live demo

The `/schema_form_demo` route (dev only) shows four tabs:

1. **Demo Schema** — `oneOf` + `dependencies`
2. **proxy-rewrite Plugin** — real APISIX plugin schema
3. **anyOf (limit-count)** — anyOf storage backend switching
4. **if/then/else (fault-injection)** — AJV-evaluated conditional fields

---

[json-schema-draft7]: https://json-schema.org/specification-links#draft-7
[rhf]: https://react-hook-form.com/
[ajv]: https://ajv.js.org/

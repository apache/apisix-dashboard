---
title: Schema Form Developer Guide
---

<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# SchemaForm Developer Guide

The `SchemaForm` component renders APISIX plugin configuration forms directly from JSON Schema definitions. This eliminates manual UI maintenance per plugin and ensures form UIs stay in sync with plugin schemas automatically.

## Quick Start

```tsx
import { SchemaForm } from '@/components/schema-form';

// Schema fetched from Admin API: GET /apisix/admin/schema/plugins/{name}
const pluginSchema = {
  type: 'object',
  properties: {
    key: { type: 'string', minLength: 1 },
    timeout: { type: 'integer', minimum: 1, default: 3 },
    ssl_verify: { type: 'boolean', default: true },
  },
  required: ['key'],
};

function PluginConfigForm() {
  return (
    <SchemaForm
      schema={pluginSchema}
      value={{ key: 'my-api-key' }}
      onSubmit={(data) => console.log('Valid config:', data)}
      onChange={(data) => console.log('Changed:', data)}
    />
  );
}
```

## Architecture

```
SchemaForm (entry point, provides react-hook-form context)
  └── SchemaField (dispatcher — routes to correct field component)
        ├── StringField      → Mantine TextInput / PasswordInput / Textarea
        ├── NumberField       → Mantine NumberInput
        ├── BooleanField      → Mantine Switch
        ├── EnumField         → Mantine Select
        ├── ObjectField       → Mantine Fieldset (recursive)
        │     ├── ConditionalProperties  (if/then/else)
        │     └── DependencyProperties   (dependencies)
        ├── ArrayField        → TagsInput (primitives) or repeatable Fieldset (objects)
        ├── OneOfField        → SegmentedControl + variant fields
        ├── AnyOfField        → SegmentedControl + variant fields
        └── PatternPropertiesField → dynamic key-value editor
```

### Data Flow

1. **Schema** is passed as a prop (fetched from APISIX Admin API at runtime).
2. `SchemaForm` initializes `react-hook-form` with defaults resolved from the schema.
3. `SchemaField` dispatches to the correct field component based on schema type/features.
4. Field components use `useController` to bind to react-hook-form state.
5. On submit, **AJV** validates the full form data against the original JSON Schema.
6. Validation errors are mapped back to individual form fields.

## Supported JSON Schema Features

### Basic Types

| Schema Type | Widget | Notes |
|---|---|---|
| `string` | `TextInput` | Auto-uses `Textarea` for `maxLength > 256` |
| `string` + `encrypt_fields` | `PasswordInput` | Masked input with reveal toggle |
| `string` + `enum` | `Select` | Dropdown with enum values |
| `number` / `integer` | `NumberInput` | Respects `min`/`max`/`step` |
| `boolean` | `Switch` | Left-positioned label |
| `object` | `Fieldset` | Recursive rendering of properties |
| `array` of strings | `TagsInput` | Tag-style input |
| `array` of objects | Repeatable `Fieldset` | Add/remove items |

### Constraints

All standard JSON Schema constraints are supported:

- `required` — field marked as required, validated on submit
- `default` — pre-populated in the form
- `minimum` / `maximum` / `exclusiveMinimum` / `exclusiveMaximum`
- `minLength` / `maxLength`
- `pattern` — shown as placeholder hint
- `minItems` / `maxItems` — controls add/remove in arrays
- `enum` — rendered as Select dropdown

### Composition Keywords

#### `oneOf`

Used in two patterns in APISIX:

1. **Top-level required alternatives** (e.g., limit-conn: `conn+burst+key` vs `rules`):
   Renders a `SegmentedControl` to select the configuration mode.

2. **Field-level type unions** (e.g., `conn: oneOf [{integer}, {string}]`):
   Renders the primary type (first option). The schema allows either an integer value or a string variable reference.

#### `anyOf`

Similar to `oneOf` but allows matching multiple schemas. Rendered with a `SegmentedControl` selector.

#### `if / then / else`

Conditional sub-schemas that show/hide fields based on other field values. Common APISIX pattern:

```json
{
  "if": { "properties": { "policy": { "enum": ["redis"] } } },
  "then": { "properties": { "redis_host": { "type": "string" } }, "required": ["redis_host"] },
  "else": {}
}
```

The form watches the `policy` field and dynamically shows `redis_host` when `policy === "redis"`.

Supports **nested** if/then/else chains (e.g., limit-conn: redis → redis-cluster fallback).

#### `dependencies`

Two forms:

1. **Simple dependencies** (`dependencies: { "a": ["b"] }`): If `a` is present, `b` is required. Handled by AJV validation.

2. **Schema dependencies with `oneOf`** (e.g., jwt-auth consumer schema):
   ```json
   {
     "dependencies": {
       "algorithm": {
         "oneOf": [
           { "properties": { "algorithm": { "enum": ["HS256", "HS384"] } } },
           { "properties": { "public_key": { "type": "string" } }, "required": ["public_key"] }
         ]
       }
     }
   }
   ```
   Watches the `algorithm` field and shows `public_key` when a non-HMAC algorithm is selected.

### APISIX-Specific Features

- **`encrypt_fields`**: Fields listed here are rendered as `PasswordInput` (masked).
- **`_meta`**: The plugin injected meta schema is stripped during validation.

## Validation

Validation uses [AJV](https://ajv.js.org/) (JSON Schema draft-07) configured with:

- `allErrors: true` — collect all errors, not just the first
- `strict: false` — allow APISIX-specific keywords
- `ajv-formats` — support for `format: "ipv4"`, `format: "ipv6"`, etc.

APISIX-specific fields (`encrypt_fields`, `_meta`, `$comment`) are stripped before compilation.

### Error Mapping

AJV errors are mapped to react-hook-form field paths:

```
/properties/redis_host  →  redis_host
/items/0/host           →  items.0.host
```

Missing required fields include the field name in the path for precise error placement.

## How to Extend

### Adding a Custom Widget

To render a specific field with a custom component:

1. Create your widget component implementing the `FieldProps` interface:

```tsx
import type { FieldProps } from '@/components/schema-form/types';

export const MyCustomWidget: React.FC<FieldProps> = ({ schema, name, required }) => {
  // Use useController from react-hook-form to bind to form state
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  
  return <div>Custom rendering for {name}</div>;
};
```

2. Modify `SchemaField.tsx` to route to your widget for the specific case:

```tsx
// In SchemaField.tsx, add before the switch statement:
if (name === 'myPlugin.specialField') {
  return <MyCustomWidget {...props} />;
}
```

### Adding Support for a New Schema Pattern

1. Identify the pattern in APISIX plugin schemas (grep for the keyword).
2. Create a new field component in `src/components/schema-form/fields/`.
3. Add routing logic in `SchemaField.tsx`.
4. Add unit tests in `__tests__/`.
5. Test with the actual plugin schema.

### Handling Unknown Schema Fragments

If the schema contains patterns that `SchemaField` cannot render, it displays a "Unsupported schema type" message. To add a fallback to the Monaco JSON editor:

```tsx
import { Editor } from '@/components/form/Editor';

// In SchemaField.tsx default case:
default:
  return <Editor name={name} />;
```

## Testing

Run unit tests:

```bash
pnpm test
```

Run in watch mode:

```bash
pnpm test:watch
```

### Test Structure

- `__tests__/utils.test.ts` — 41 tests for utility functions
- `__tests__/validation.test.ts` — 9 tests for AJV validation pipeline
- `__tests__/SchemaForm.test.tsx` — 10 integration tests for component rendering

### Testing with Real Plugin Schemas

To test with actual APISIX plugin schemas, fetch them from the Admin API:

```bash
curl http://localhost:9180/apisix/admin/schema/plugins/limit-count \
  -H 'X-API-KEY: your-api-key'
```

Then pass the response JSON to `SchemaForm` as the `schema` prop.

## File Structure

```
src/components/schema-form/
├── index.ts                    # Barrel exports
├── SchemaForm.tsx              # Entry point component
├── types.ts                    # TypeScript type definitions
├── utils.ts                    # Schema helper utilities
├── validation.ts               # AJV validation bridge
├── fields/
│   ├── SchemaField.tsx         # Field dispatcher
│   ├── StringField.tsx         # String input
│   ├── NumberField.tsx         # Number/integer input
│   ├── BooleanField.tsx        # Switch toggle
│   ├── EnumField.tsx           # Select dropdown
│   ├── ObjectField.tsx         # Nested object fieldset
│   ├── ArrayField.tsx          # Array (tags or repeatable)
│   ├── OneOfField.tsx          # oneOf selector
│   ├── AnyOfField.tsx          # anyOf selector
│   └── PatternPropertiesField.tsx # Dynamic key-value editor
└── __tests__/
    ├── utils.test.ts
    ├── validation.test.ts
    └── SchemaForm.test.tsx
```

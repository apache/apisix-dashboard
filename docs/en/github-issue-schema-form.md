---
title: GitHub Issue Template - Schema Form Feature Request
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

# GitHub Issue Template

Use this template when filing the feature request issue on `apache/apisix-dashboard`.

---

**Title:** `feat(plugin): JSON Schema-driven form renderer (SchemaForm) for plugin configuration`

**Body:**

## Description

APISIX plugins ship JSON Schema definitions for their configuration. The Dashboard currently relies on a raw JSON/Monaco editor for plugin config. If the Dashboard can render plugin configuration forms directly from JSON Schema, developer experience improves significantly and manual UI maintenance per plugin is eliminated.

## Motivation

- 150+ plugins, each with unique config schemas — maintaining hand-coded forms is unsustainable.
- The Admin API already exposes full JSON Schema at `GET /apisix/admin/schema/plugins/{name}`.
- The new Dashboard (React 19 + Mantine 8 + react-hook-form + zod) has the right foundation but lacks a schema-to-form bridge.

## Deliverables

### Must-have (P0)

1. Reusable `SchemaForm` component that accepts a JSON Schema object and renders a complete form.
2. Widget mapping for basic types: `string` → TextInput, `number`/`integer` → NumberInput, `boolean` → Switch, `object` → nested fieldset, `array` → repeatable field group.
3. `enum` support → Select dropdown.
4. `default` values pre-populated, `required` fields marked/enforced.
5. Basic constraints: `minimum`/`maximum`, `minLength`/`maxLength`, `pattern`, `exclusiveMinimum`, `minItems`/`maxItems`.
6. `oneOf` support — selector to choose a variant, render corresponding fields.
7. `dependencies` / conditional fields — show/hide fields based on other field values.
8. `if/then/else` conditional sub-schema rendering (used heavily: limit-conn policy→redis, jwt-auth algorithm→public_key).
9. Validation via AJV against the original JSON Schema, with inline error display.
10. `encrypt_fields` meta → render as password inputs.

### Should-have (P1)

11. `anyOf` support (select + render).
12. `patternProperties` support (dynamic key-value editor).
13. Fallback to Monaco JSON editor for unrecognized/complex schema portions.
14. Schema-to-widget override registry (custom widget for specific plugin fields).

### Nice-to-have (P2)

15. `allOf` merging.
16. `$ref` / `$defs` resolution.
17. Read-only/disabled mode for viewing existing config.

## Non-goals

- Schema authoring/editing in the UI.
- Modifying APISIX core Lua schema definitions.

## Technical Notes

- Schemas are fetched at runtime from Admin API; no build-time schema bundling needed.
- Existing `src/components/form/` widgets should be reused/wrapped.
- Validation: AJV for schema validation, bridge errors to react-hook-form `setError`.
- APISIX-specific non-standard keys (`encrypt_fields`, `_meta`) need explicit handling.

## APISIX Plugin Schema Patterns to Support

| Pattern | Example Plugins |
|---|---|
| `oneOf` (top-level required alternatives) | `limit-conn`, `limit-count` |
| `oneOf` (field-level type union) | `limit-conn` (`conn`) |
| `dependencies` + `oneOf` | `jwt-auth` consumer schema |
| `dependencies` + `not` (mutual exclusion) | `response-rewrite` |
| `if/then/else` | `limit-conn`, `openid-connect`, `ai-proxy` |
| `anyOf` | `schema_def.lua` id_schema, `ai-proxy-multi` |
| `enum` | Ubiquitous |
| `patternProperties` | `ai-proxy` auth_schema, `labels_def` |
| Nested `object` | Nearly all plugins |
| `array` of objects | `traffic-split`, health checker |

## Related

- Admin API schema endpoint: `apisix/admin/plugins.lua`
- Core schemas: `apisix/schema_def.lua`
- Dashboard technical design: https://github.com/apache/apisix-dashboard/issues/2988

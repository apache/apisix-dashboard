export function parseSchema(schema: any) {
  if (!schema || !schema.properties) return [];

  return Object.entries(schema.properties).map(([name, prop]: any) => ({
    name,
    type: prop.type,
    required: schema.required?.includes(name) || false,
    enum: prop.enum || null,
    default: prop.default ?? null
  }));
}
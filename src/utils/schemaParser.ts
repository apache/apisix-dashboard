export function parseSchema(schema: any) {
  if (!schema || !schema.properties) return [];

  return Object.entries(schema.properties).map(([name, prop]: any) => {
    let fieldType = prop.type;

    // Handle enum → treat as select type
    if (prop.enum) {
      fieldType = 'enum';
    }

    return {
      name,
      type: fieldType,
      required: schema.required?.includes(name) || false,
      enum: prop.enum || null,
      default: prop.default ?? null,
      description: prop.description || '',
    };
  });
}
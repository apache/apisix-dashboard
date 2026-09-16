/**
 * SchemaForm.tsx
 * Main component that renders a form automatically
 * from a JSON Schema definition.
 *
 * Usage:
 * <SchemaForm
 *   schema={pluginSchema}
 *   onSubmit={(values) => console.log(values)}
 * />
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Group,
  Switch,
  Select,
  TextInput,
  NumberInput,
  Textarea,
  PasswordInput,
  JsonInput,
  TagsInput,
  Text,
  Stack,
  Paper,
  Title,
  Alert,
} from '@mantine/core';
import Ajv from 'ajv';

import { parseSchema, type JSONSchema, type ParsedField } from './schemaParser';
import { getWidget, getValidationRules } from './widgetMapper';

// ── AJV setup ────────────────────────────────────────────────────────────────
const ajv = new Ajv({ allErrors: true });

// ── Props ─────────────────────────────────────────────────────────────────────
interface SchemaFormProps {
  // The JSON Schema to render
  schema: JSONSchema;
  // Called when form is submitted with valid data
  onSubmit: (values: Record<string, unknown>) => void;
  // Optional initial values
  defaultValues?: Record<string, unknown>;
  // Optional submit button label
  submitLabel?: string;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const SchemaForm = ({
  schema,
  onSubmit,
  defaultValues = {},
  submitLabel = 'Save',
}: SchemaFormProps) => {
  const [ajvErrors, setAjvErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  // Parse schema into fields
  const fields = parseSchema(schema, schema.required || []);

  // Handle form submission with AJV validation
  const onFormSubmit = (values: Record<string, unknown>) => {
    const validate = ajv.compile(schema);
    const valid = validate(values);

    if (!valid && validate.errors) {
      const errorMessages = validate.errors.map(
        (e) => `${e.instancePath || 'Field'} ${e.message}`
      );
      setAjvErrors(errorMessages);
      return;
    }

    setAjvErrors([]);
    onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
      <Stack gap="md">
        {/* AJV validation errors */}
        {ajvErrors.length > 0 && (
          <Alert color="red" title="Validation Errors">
            {ajvErrors.map((err, i) => (
              <Text key={i} size="sm">{err}</Text>
            ))}
          </Alert>
        )}

        {/* Render each field */}
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            schema={schema}
          />
        ))}

        {/* Submit button */}
        <Group justify="flex-end">
          <Button type="submit">{submitLabel}</Button>
        </Group>
      </Stack>
    </Box>
  );
};

// ── Field Renderer ────────────────────────────────────────────────────────────
interface FieldRendererProps {
  field: ParsedField;
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
  setValue: ReturnType<typeof useForm>['setValue'];
  watch: ReturnType<typeof useForm>['watch'];
  schema: JSONSchema;
}

const FieldRenderer = ({
  field,
  register,
  errors,
  setValue,
  watch,
  schema,
}: FieldRendererProps) => {
  const widget = getWidget(field);
  const rules = getValidationRules(field);
  const error = errors[field.name]?.message as string | undefined;
  const value = watch(field.name as never);

  // ── OneOf Widget ────────────────────────────────────────────────────────
  if (widget === 'OneOfInput' && field.oneOf) {
    return (
      <OneOfRenderer
        field={field}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />
    );
  }

  // ── Nested Object ───────────────────────────────────────────────────────
  if (field.type === 'object' && field.fields && field.fields.length > 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Title order={5} mb="sm">{field.label}</Title>
        {field.description && (
          <Text size="xs" c="dimmed" mb="sm">{field.description}</Text>
        )}
        <Stack gap="sm">
          {field.fields.map((subField) => (
            <FieldRenderer
              key={`${field.name}.${subField.name}`}
              field={{ ...subField, name: `${field.name}.${subField.name}` }}
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              schema={schema}
            />
          ))}
        </Stack>
      </Paper>
    );
  }

  // ── Switch (boolean) ────────────────────────────────────────────────────
  if (widget === 'Switch') {
    return (
      <Switch
        label={field.label}
        description={field.description}
        checked={!!value}
        onChange={(e) => setValue(field.name as never, e.currentTarget.checked)}
        error={error}
      />
    );
  }

  // ── Select (enum) ───────────────────────────────────────────────────────
  if (widget === 'Select') {
    return (
      <Select
        label={field.label}
        description={field.description}
        data={field.options || []}
        value={value as string}
        onChange={(val) => setValue(field.name as never, val)}
        error={error}
        required={field.required}
        placeholder={`Select ${field.label}`}
      />
    );
  }

  // ── Number Input ────────────────────────────────────────────────────────
  if (widget === 'NumberInput') {
    return (
      <NumberInput
        label={field.label}
        description={field.description}
        value={value as number}
        onChange={(val) => setValue(field.name as never, val)}
        min={field.minimum}
        max={field.maximum}
        error={error}
        required={field.required}
      />
    );
  }

  // ── Tags Input (array) ──────────────────────────────────────────────────
  if (widget === 'TagInput') {
    return (
      <TagsInput
        label={field.label}
        description={field.description}
        value={(value as string[]) || []}
        onChange={(val) => setValue(field.name as never, val)}
        error={error}
        required={field.required}
        placeholder={`Add ${field.label}`}
      />
    );
  }

  // ── JSON Input (object) ─────────────────────────────────────────────────
  if (widget === 'JsonInput') {
    return (
      <JsonInput
        label={field.label}
        description={field.description}
        value={value ? JSON.stringify(value, null, 2) : ''}
        onChange={(val) => {
          try {
            setValue(field.name as never, JSON.parse(val));
          } catch {
            // invalid JSON — ignore
          }
        }}
        error={error}
        required={field.required}
        formatOnBlur
        autosize
        minRows={3}
      />
    );
  }

  // ── Password Input ──────────────────────────────────────────────────────
  if (widget === 'PasswordInput') {
    return (
      <PasswordInput
        label={field.label}
        description={field.description}
        error={error}
        required={field.required}
        {...register(field.name as never, rules)}
      />
    );
  }

  // ── Textarea ────────────────────────────────────────────────────────────
  if (widget === 'Textarea') {
    return (
      <Textarea
        label={field.label}
        description={field.description}
        error={error}
        required={field.required}
        autosize
        minRows={2}
        {...register(field.name as never, rules)}
      />
    );
  }

  // ── Default: Text Input ─────────────────────────────────────────────────
  return (
    <TextInput
      label={field.label}
      description={field.description}
      error={error}
      required={field.required}
      {...register(field.name as never, rules)}
    />
  );
};

// ── OneOf Renderer ────────────────────────────────────────────────────────────
interface OneOfRendererProps {
  field: ParsedField;
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
  setValue: ReturnType<typeof useForm>['setValue'];
  watch: ReturnType<typeof useForm>['watch'];
}

const OneOfRenderer = ({
  field,
  register,
  errors,
  setValue,
  watch,
}: OneOfRendererProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = field.oneOf || [];
  const selectedSchema = options[selectedIndex]?.schema;
  const selectedFields = selectedSchema
    ? parseSchema(selectedSchema, selectedSchema.required || [])
    : [];

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={5} mb="sm">{field.label}</Title>
      {field.description && (
        <Text size="xs" c="dimmed" mb="sm">{field.description}</Text>
      )}

      {/* Dropdown to pick which oneOf option */}
      <Select
        label="Select type"
        data={options.map((opt, i) => ({
          value: String(i),
          label: opt.title,
        }))}
        value={String(selectedIndex)}
        onChange={(val) => setSelectedIndex(Number(val))}
        mb="md"
      />

      {/* Render fields for selected option */}
      <Stack gap="sm">
        {selectedFields.map((subField) => (
          <FieldRenderer
            key={`${field.name}.${subField.name}`}
            field={{ ...subField, name: `${field.name}.${subField.name}` }}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            schema={selectedSchema!}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default SchemaForm;
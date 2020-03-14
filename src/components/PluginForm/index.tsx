import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, Select, InputNumber, Button } from 'antd';
import { useForm } from 'antd/es/form/util';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { fetchPluginSchema } from '@/services/plugin';
import { transformPropertyToRules } from '@/transforms/plugin';

interface Props {
  name: string;
  initialData?: PluginSchema;
  onFinish(values: any): void;
}

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface RenderComponentProps {
  placeholder?: string;
}

const renderComponentByProperty = (
  propertyValue: PluginProperty,
  restProps?: RenderComponentProps,
) => {
  const { type, minimum, maximum } = propertyValue;

  if (type === 'string') {
    if (propertyValue.enum) {
      return (
        <Select>
          {propertyValue.enum.map(enumValue => (
            <Select.Option value={enumValue} key={enumValue}>
              {enumValue}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input {...restProps} />;
  }

  if (type === 'boolean') {
    return <Switch />;
  }

  if (type === 'number' || type === 'integer') {
    return (
      <InputNumber
        min={minimum ?? Number.MIN_SAFE_INTEGER}
        max={maximum ?? Number.MAX_SAFE_INTEGER}
      />
    );
  }

  return <Input {...restProps} />;
};

interface ArrayComponentProps {
  schema: PluginSchema;
  propertyName: string;
  propertyValue: PluginProperty;
}

const ArrayComponent: React.FC<ArrayComponentProps> = ({
  propertyName,
  propertyValue,
  schema,
  children,
}) => (
  <Form.List key={propertyName} name={propertyName}>
    {(fields, { add, remove }) => (
      <>
        {fields.map((field, index) => (
          <Form.Item
            key={field.key}
            rules={transformPropertyToRules(schema!, propertyName, propertyValue)}
            label={`${propertyName}-${index + 1}`}
          >
            {children}
            {fields.length > 1 ? (
              <MinusCircleOutlined onClick={() => remove(field.name)} />
            ) : (
              <React.Fragment />
            )}
          </Form.Item>
        ))}
        {/* BUG: There should also care about minItems */}
        {fields.length < (propertyValue.maxItems ?? Number.MAX_SAFE_INTEGER) ? (
          <Form.Item label={propertyName}>
            <Button type="dashed" onClick={add}>
              {/* TODO: i18n */}
              <PlusOutlined /> Add
            </Button>
          </Form.Item>
        ) : null}
      </>
    )}
  </Form.List>
);

const PluginForm: React.FC<Props> = ({ name, initialData = {}, onFinish }) => {
  const [schema, setSchema] = useState<PluginSchema>();
  const [form] = useForm();

  useEffect(() => {
    if (name) {
      fetchPluginSchema(name).then(data => {
        setSchema(data);
        console.log(name, data);

        const propertyDefaultData = {};
        Object.entries(data.properties || {}).forEach(([propertyName, propertyValue]) => {
          if (propertyValue.hasOwnProperty('default')) {
            propertyDefaultData[propertyName] = propertyValue.default;
          }
        });
        form.setFieldsValue(propertyDefaultData);

        requestAnimationFrame(() => {
          form.setFieldsValue(initialData);
        });
      });
    }
  }, [name]);

  return (
    <Form {...formLayout} form={form} onFinish={onFinish} labelAlign="left">
      {Object.entries(schema?.properties || {}).map(([propertyName, propertyValue]) => {
        // eslint-disable-next-line arrow-body-style
        if (propertyValue.type === 'array') {
          return (
            <ArrayComponent
              key={propertyName}
              schema={schema!}
              propertyName={propertyName}
              propertyValue={propertyValue}
            >
              {renderComponentByProperty({ type: 'string' })}
            </ArrayComponent>
          );
        }

        if (propertyValue.type === 'object') {
          return (
            <ArrayComponent
              key={propertyName}
              schema={schema!}
              propertyName={propertyName}
              propertyValue={propertyValue}
            >
              {/* TODO: there should not be fixed value, and it should receive custom key */}
              {renderComponentByProperty({ type: 'string' }, { placeholder: 'Header' })}
              {renderComponentByProperty({ type: 'string' }, { placeholder: 'Value' })}
            </ArrayComponent>
          );
        }

        return (
          <Form.Item
            label={propertyName}
            name={propertyName}
            key={propertyName}
            rules={transformPropertyToRules(schema!, propertyName, propertyValue)}
            valuePropName={propertyValue.type === 'boolean' ? 'checked' : 'value'}
          >
            {renderComponentByProperty(propertyValue)}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default PluginForm;

import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, Select, InputNumber, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

import { fetchPluginSchema } from './service';
import { transformPropertyToRules } from './transformer';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface RenderComponentProps {
  placeholder?: string;
  disabled?: boolean;
}

const renderComponentByProperty = (
  propertyValue: PluginForm.PluginProperty,
  restProps?: RenderComponentProps,
) => {
  const { type, minimum, maximum } = propertyValue;

  if (type === 'string') {
    if (propertyValue.enum) {
      return (
        <Select disabled={restProps?.disabled}>
          {propertyValue.enum.map((enumValue) => (
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
    return <Switch {...restProps} />;
  }

  if (type === 'number' || type === 'integer') {
    return (
      <InputNumber
        min={minimum ?? Number.MIN_SAFE_INTEGER}
        max={maximum ?? Number.MAX_SAFE_INTEGER}
        {...restProps}
      />
    );
  }

  return <Input {...restProps} />;
};

interface ArrayComponentProps {
  disabled?: boolean;
  schema: PluginForm.PluginSchema;
  propertyName: string;
  propertyValue: PluginForm.PluginProperty;
}

const ArrayComponent: React.FC<ArrayComponentProps> = ({
  propertyName,
  propertyValue,
  schema,
  disabled,
  children,
}) => {
  const { formatMessage } = useIntl();
  return (
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
              <Button type="dashed" onClick={add} disabled={disabled}>
                <PlusOutlined /> {formatMessage({ id: 'component.global.add' })}
              </Button>
            </Form.Item>
          ) : null}
        </>
      )}
    </Form.List>
  );
};

const PluginForm: React.FC<PluginForm.Props> = ({
  name,
  form,
  disabled,
  initialData = {},
  onFinish,
}) => {
  const { formatMessage } = useIntl();
  const [schema, setSchema] = useState<PluginForm.PluginSchema>();

  useEffect(() => {
    if (name) {
      setSchema(undefined);
      fetchPluginSchema(name).then((data) => {
        setSchema(data);

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
              disabled={disabled}
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
              disabled={disabled}
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
            label={formatMessage({
              id: `PluginForm.plugin.${name}.property.${propertyName}`,
              defaultMessage: propertyName,
            })}
            extra={formatMessage({
              id: `PluginForm.plugin.${name}.property.${propertyName}.extra`,
              defaultMessage: '',
            })}
            name={propertyName}
            key={propertyName}
            rules={transformPropertyToRules(schema!, propertyName, propertyValue)}
            valuePropName={propertyValue.type === 'boolean' ? 'checked' : 'value'}
          >
            {renderComponentByProperty(propertyValue, { disabled })}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default PluginForm;

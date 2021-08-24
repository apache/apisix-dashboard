/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  notification,
  PageHeader,
  Popconfirm,
  Select,
  Space,
  Switch,
} from 'antd';
import { useIntl } from 'umi';
import { js_beautify } from 'js-beautify';
import { LinkOutlined } from '@ant-design/icons';
import Ajv from 'ajv';
import type { DefinedError } from 'ajv';
import addFormats from 'ajv-formats';
import { compact, omit } from 'lodash';
import type { Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import type { languages } from 'monaco-editor';

import { fetchSchema } from './service';
import { json2yaml, yaml2json } from '../../helpers';
import { PluginForm, PLUGIN_UI_LIST } from './UI';

type Props = {
  name: string;
  type?: 'global' | 'scoped';
  schemaType: PluginComponent.Schema;
  initialData: Record<string, any>;
  pluginList: PluginComponent.Meta[];
  readonly?: boolean;
  visible: boolean;
  maskClosable?: boolean;
  isEnabled?: boolean;
  onClose?: () => void;
  onChange?: (data: PluginComponent.PluginDetailValues) => void;
};

const ajv = new Ajv();
addFormats(ajv);

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 16,
  },
};

// NOTE: This function has side effect because it mutates the original schema data
const injectDisableProperty = (schema: Record<string, any>) => {
  // NOTE: The frontend will inject the disable property into schema just like the manager-api does
  if (!schema.properties) {
    // eslint-disable-next-line
    schema.properties = {};
  }
  // eslint-disable-next-line
  (schema.properties as any).disable = {
    type: 'boolean',
  };
  return schema;
};

const PluginDetail: React.FC<Props> = ({
  name,
  type = 'scoped',
  schemaType = 'route',
  visible,
  pluginList = [],
  readonly = false,
  maskClosable = true,
  isEnabled = false,
  initialData = {},
  onClose = () => {},
  onChange = () => {},
}) => {
  const { formatMessage } = useIntl();
  enum monacoModeList {
    JSON = 'JSON',
    YAML = 'YAML',
    UIForm = 'Form',
  }
  const [form] = Form.useForm();
  const [UIForm] = Form.useForm();
  const data = initialData[name] || {};
  const pluginType = pluginList.find((item) => item.name === name)?.originType;
  const schemaName = name === 'basic-auth' ? 'consumer_schema' : 'schema';
  const pluginSchema = pluginList.find((item) => item.name === name)?.[schemaName];
  const [content, setContent] = useState<string>(JSON.stringify(data, null, 2));
  const [monacoMode, setMonacoMode] = useState<PluginComponent.MonacoLanguage>(monacoModeList.JSON);
  const modeOptions: { label: string; value: string }[] = [
    { label: monacoModeList.JSON, value: monacoModeList.JSON },
    { label: monacoModeList.YAML, value: monacoModeList.YAML },
  ];

  if (PLUGIN_UI_LIST.includes(name)) {
    modeOptions.push({
      label: formatMessage({ id: 'component.plugin.form' }),
      value: monacoModeList.UIForm,
    });
  }

  const getUIFormData = () => {
    if (name === 'cors') {
      const formData = UIForm.getFieldsValue();
      const newMethods = formData.allow_methods.join(',');
      const compactAllowRegex = compact(formData.allow_origins_by_regex);
      // Note: default allow_origins_by_regex setted for UI is [''], but this is not allowed, omit it.
      if (compactAllowRegex.length === 0) {
        return omit({ ...formData, allow_methods: newMethods }, ['allow_origins_by_regex']);
      }

      return { ...formData, allow_methods: newMethods };
    }
    return UIForm.getFieldsValue();
  };

  const setUIFormData = (formData: any) => {
    if (name === 'cors' && formData) {
      const methods = (formData.allow_methods || '').length
        ? formData.allow_methods.split(',')
        : ['*'];
      UIForm.setFieldsValue({ ...formData, allow_methods: methods });
      return;
    }
    UIForm.setFieldsValue(formData);
  };

  useEffect(() => {
    form.setFieldsValue({
      disable: isEnabled ? true : initialData[name] && !initialData[name].disable,
      scope: 'global',
    });
    if (PLUGIN_UI_LIST.includes(name)) {
      setMonacoMode(monacoModeList.UIForm);
      setUIFormData(initialData[name]);
    }
  }, []);

  const formatYaml = (yaml: string): string => {
    const json = yaml2json(yaml, true);
    if (json.error) {
      return yaml;
    }
    return json2yaml(json.data).data;
  };

  const editorWillMount = (monaco: Monaco) => {
    fetchSchema(name, schemaType).then((schema) => {
      const schemaConfig: languages.json.DiagnosticsOptions = {
        validate: true,
        schemas: [
          {
            // useless placeholder
            uri: `https://apisix.apache.org/`,
            fileMatch: ['*'],
            schema,
          },
        ],
        trailingCommas: 'error',
        enableSchemaRequest: false,
      };
      const yamlFormatProvider: languages.DocumentFormattingEditProvider = {
        provideDocumentFormattingEdits(model) {
          return [
            {
              text: formatYaml(model.getValue()),
              range: model.getFullModelRange(),
            },
          ];
        },
      };
      monaco.languages.registerDocumentFormattingEditProvider('yaml', yamlFormatProvider);
      monaco.editor.getModels().forEach((model) => model.updateOptions({ tabSize: 2 }));
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(schemaConfig);
    });
  };

  const validateData = (pluginName: string, value: PluginComponent.Data) => {
    return fetchSchema(pluginName, schemaType).then((schema) => {
      return new Promise((resolve) => {
        if (schema.oneOf) {
          (schema.oneOf || []).forEach((item: any) => {
            injectDisableProperty(item);
          });
        } else {
          injectDisableProperty(schema);
        }
        const validate = ajv.compile(schema);
        if (validate(value)) {
          resolve(value);
          return;
        }

        // eslint-disable-next-line
        for (const err of validate.errors as DefinedError[]) {
          let description = '';
          switch (err.keyword) {
            case 'enum':
              description = `${err.dataPath} ${err.message}: ${err.params.allowedValues.join(
                ', ',
              )}`;
              break;
            case 'minItems':
            case 'type':
              description = `${err.dataPath} ${err.message}`;
              break;
            case 'oneOf':
            case 'required':
              description = err.message || '';
              break;
            default:
              description = `${err.schemaPath} ${err.message}`;
          }
          notification.error({
            message: 'Invalid plugin data',
            description,
          });
        }
      });
    });
  };

  const handleModeChange = (value: PluginComponent.MonacoLanguage) => {
    switch (value) {
      case monacoModeList.JSON: {
        if (monacoMode === monacoModeList.YAML) {
          const { data: yamlData, error } = yaml2json(content, true);
          if (error) {
            notification.error({ message: formatMessage({ id: 'component.global.invalidYaml' }) });
            return;
          }
          setContent(js_beautify(yamlData, { indent_size: 2 }));
        } else {
          setContent(js_beautify(JSON.stringify(getUIFormData()), { indent_size: 2 }));
        }
        break;
      }
      case monacoModeList.YAML: {
        const jsonData =
          monacoMode === monacoModeList.JSON ? content : JSON.stringify(getUIFormData());
        const { data: yamlData, error } = json2yaml(jsonData);
        if (error) {
          notification.error({ message: formatMessage({ id: 'component.global.invalidJson' }) });
          return;
        }
        setContent(yamlData);
        break;
      }

      case monacoModeList.UIForm: {
        if (monacoMode === monacoModeList.JSON) {
          setUIFormData(JSON.parse(content));
        } else {
          const { data: yamlData, error } = yaml2json(content, true);
          if (error) {
            notification.error({ message: formatMessage({ id: 'component.global.invalidYaml' }) });
            return;
          }
          setUIFormData(JSON.parse(yamlData));
        }
        break;
      }
      default:
        break;
    }
    setMonacoMode(value);
  };

  const isNoConfigurationRequired =
    pluginType === 'auth' && schemaType !== 'consumer' && monacoMode !== monacoModeList.UIForm;

  return (
    <Drawer
      title={formatMessage({ id: 'component.plugin.editor' })}
      visible={visible}
      placement="right"
      closable={false}
      maskClosable={maskClosable}
      destroyOnClose
      onClose={onClose}
      width={700}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {' '}
          <Button onClick={onClose} key={1}>
            {formatMessage({ id: 'component.global.cancel' })}
          </Button>
          <Space>
            <Popconfirm
              title={formatMessage({ id: 'page.plugin.drawer.popconfirm.title.delete' })}
              okText={formatMessage({ id: 'component.global.confirm' })}
              cancelText={formatMessage({ id: 'component.global.cancel' })}
              disabled={readonly}
              onConfirm={() => {
                onChange({
                  formData: form.getFieldsValue(),
                  monacoData: {},
                  shouldDelete: true,
                });
              }}
            >
              {initialData[name] ? (
                <Button key={3} type="primary" danger disabled={readonly}>
                  {formatMessage({ id: 'component.global.delete' })}
                </Button>
              ) : null}
            </Popconfirm>
            <Button
              key={2}
              disabled={readonly}
              type="primary"
              onClick={() => {
                try {
                  let editorData;
                  if (monacoMode === monacoModeList.JSON) {
                    editorData = JSON.parse(content);
                  } else if (monacoMode === monacoModeList.YAML) {
                    editorData = yaml2json(content, false).data;
                  } else {
                    editorData = getUIFormData();
                  }

                  validateData(name, editorData).then((value) => {
                    onChange({ formData: form.getFieldsValue(), monacoData: value });
                  });
                } catch (error) {
                  notification.error({
                    message: formatMessage({ id: 'component.global.invalidJson' }),
                  });
                }
              }}
            >
              {formatMessage({ id: 'component.global.submit' })}
            </Button>
          </Space>
        </div>
      }
    >
      <style>
        {`
        .site-page-header {
          border: 1px solid rgb(235, 237, 240);
          margin-top:10px;
        }
        .ant-input[disabled] {
          color: #000;
        }
      `}
      </style>

      <Form {...FORM_ITEM_LAYOUT} style={{ marginTop: '10px' }} form={form}>
        <Form.Item label={formatMessage({ id: 'component.global.name' })}>
          <Input value={name} bordered={false} disabled />
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'component.global.enable' })}
          valuePropName="checked"
          name="disable"
        >
          <Switch
            defaultChecked={isEnabled ? true : initialData[name] && !initialData[name].disable}
            disabled={readonly || isEnabled}
          />
        </Form.Item>
        {type === 'global' && (
          <Form.Item label={formatMessage({ id: 'component.global.scope' })} name="scope">
            <Select disabled>
              <Select.Option value="global">{formatMessage({ id: 'other.global' })}</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
      <Divider orientation="left">{formatMessage({ id: 'component.global.data.editor' })}</Divider>
      <PageHeader
        title=""
        subTitle={
          isNoConfigurationRequired ? (
            <Alert
              message={formatMessage({ id: 'component.plugin.noConfigurationRequired' })}
              type="warning"
            />
          ) : null
        }
        ghost={false}
        extra={[
          <Select
            defaultValue={monacoModeList.JSON}
            value={monacoMode}
            options={modeOptions}
            onChange={handleModeChange}
            data-cy="monaco-mode"
            key={1}
          />,
          <Button
            type="default"
            icon={<LinkOutlined />}
            onClick={() => {
              if (name.startsWith('serverless')) {
                window.open('https://apisix.apache.org/docs/apisix/plugins/serverless');
              } else {
                window.open(`https://apisix.apache.org/docs/apisix/plugins/${name}`);
              }
            }}
            key={3}
          >
            {formatMessage({ id: 'component.global.document' })}
          </Button>,
        ]}
      />
      {Boolean(monacoMode === monacoModeList.UIForm) && (
        <PluginForm
          name={name}
          schema={pluginSchema}
          form={UIForm}
          renderForm={!(pluginType === 'auth' && schemaType !== 'consumer')}
        />
      )}
      <div style={{ display: monacoMode === monacoModeList.UIForm ? 'none' : 'unset' }}>
        <Editor
          value={content}
          onChange={(text) => {
            if (text) {
              setContent(text);
            } else {
              setContent('');
            }
          }}
          language={monacoMode.toLocaleLowerCase()}
          onMount={(editor) => {
            // NOTE: for debug & test
            // @ts-ignore
            window.monacoEditor = editor;
          }}
          beforeMount={editorWillMount}
          options={{
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden',
            },
            wordWrap: 'on',
            minimap: { enabled: false },
            readOnly: readonly,
          }}
        />
      </div>
    </Drawer>
  );
};

export default PluginDetail;

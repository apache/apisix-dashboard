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
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  notification,
  PageHeader,
  Switch,
  Form,
  Select,
  Divider,
  Drawer,
  Alert,
  Space,
  Popconfirm,
  Tooltip,
  Input,
} from 'antd';
import { useIntl } from 'umi';
import CodeMirror from '@uiw/react-codemirror';
import { js_beautify } from 'js-beautify';
import { LinkOutlined } from '@ant-design/icons';
import Ajv from 'ajv';
import type { DefinedError } from 'ajv';
import addFormats from 'ajv-formats';

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
  onClose?: () => void;
  onChange?: (data: any) => void;
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
  initialData = {},
  onClose = () => { },
  onChange = () => { },
}) => {
  const { formatMessage } = useIntl();
  enum codeMirrorModeList {
    JSON = 'JSON',
    YAML = 'YAML',
    UIForm = 'Form'
  }
  const [form] = Form.useForm();
  const [UIForm] = Form.useForm();
  const ref = useRef<any>(null);
  const data = initialData[name] || {};
  const pluginType = pluginList.find((item) => item.name === name)?.type;
  const [codeMirrorMode, setCodeMirrorMode] = useState<PluginComponent.CodeMirrorMode>(
    codeMirrorModeList.JSON,
  );
  const modeOptions: { label: string; value: string }[] = [
    { label: codeMirrorModeList.JSON, value: codeMirrorModeList.JSON },
    { label: codeMirrorModeList.YAML, value: codeMirrorModeList.YAML },
  ];

  if (PLUGIN_UI_LIST.includes(name)) {
    modeOptions.push({ label: formatMessage({ id: 'component.plugin.form' }), value: codeMirrorModeList.UIForm });
  }

  const getUIFormData = () => {
    if (name === 'cors') {
      const formData = UIForm.getFieldsValue();
      const newMethods = formData.allow_methods.join(",");
      return { ...formData, allow_methods: newMethods };
    }
    return UIForm.getFieldsValue();
  };

  const setUIFormData = (formData: any) => {
    if (name === 'cors' && formData) {
      const methods = (formData.allow_methods || '').length ? formData.allow_methods.split(",") : ["*"];
      UIForm.setFieldsValue({ ...formData, allow_methods: methods });
      return;
    }
    UIForm.setFieldsValue(formData);
  };

  useEffect(() => {
    form.setFieldsValue({
      disable: initialData[name] && !initialData[name].disable,
      scope: 'global',
    });
    if (PLUGIN_UI_LIST.includes(name)) {
      setCodeMirrorMode(codeMirrorModeList.UIForm);
      setUIFormData(initialData[name]);
    };
  }, []);

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
  const handleModeChange = (value: PluginComponent.CodeMirrorMode) => {
    switch (value) {
      case codeMirrorModeList.JSON: {
        if (codeMirrorMode === codeMirrorModeList.YAML) {
          const { data: yamlData, error } = yaml2json(ref.current.editor.getValue(), true);
          if (error) {
            notification.error({
              message: 'Invalid Yaml data',
            });
            return;
          }
          ref.current.editor.setValue(
            js_beautify(yamlData, {
              indent_size: 2,
            }),
          );
        } else {
          ref.current.editor.setValue(
            js_beautify(JSON.stringify(getUIFormData()), {
              indent_size: 2,
            }),
          );
        }
        break;
      }
      case codeMirrorModeList.YAML: {
        const { data: jsonData, error } = json2yaml(codeMirrorMode === codeMirrorModeList.JSON ? ref.current.editor.getValue() : JSON.stringify(getUIFormData()));

        if (error) {
          notification.error({
            message: 'Invalid Json data',
          });
          return;
        }
        ref.current.editor.setValue(jsonData);
        break;
      }

      case codeMirrorModeList.UIForm: {
        if (codeMirrorMode === codeMirrorModeList.JSON) {
          setUIFormData(JSON.parse(ref.current.editor.getValue()));
        } else {
          const { data: yamlData, error } = yaml2json(ref.current.editor.getValue(), true);
          if (error) {
            notification.error({
              message: 'Invalid Yaml data',
            });
            return;
          }
          setUIFormData(JSON.parse(yamlData));
        }
        break;
      }
      default:
        break;
    }
    setCodeMirrorMode(value);
  };

  const formatCodes = () => {
    try {
      if (ref.current) {
        ref.current.editor.setValue(
          js_beautify(ref.current.editor.getValue(), {
            indent_size: 2,
          }),
        );
      }
    } catch (error) {
      notification.error({
        message: 'Format failed',
      });
    }
  };

  return (
    <>
      <Drawer
        title={formatMessage({ id: 'component.plugin.editor' })}
        visible={visible}
        placement="right"
        closable={false}
        maskClosable={maskClosable}
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
                onConfirm={() => {
                  onChange({
                    formData: form.getFieldsValue(),
                    codemirrorData: {},
                    shouldDelete: true,
                  });
                }}
              >
                {initialData[name] ? (
                  <Button key={3} type="primary" danger>
                    {formatMessage({ id: 'component.global.delete' })}
                  </Button>
                ) : null}
              </Popconfirm>
              <Button
                key={2}
                type="primary"
                onClick={() => {
                  try {
                    let editorData;
                    if (codeMirrorMode === codeMirrorModeList.JSON) {
                      editorData = JSON.parse(ref.current?.editor.getValue());
                    } else if (codeMirrorMode === codeMirrorModeList.YAML) {
                      editorData = yaml2json(ref.current?.editor.getValue(), false).data;
                    } else {
                      editorData = getUIFormData();
                    }

                    validateData(name, editorData).then((value) => {
                      onChange({ formData: form.getFieldsValue(), codemirrorData: value });
                    });
                  } catch (error) {
                    notification.error({
                      message: 'Invalid JSON data',
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
          <Form.Item label={formatMessage({ id: 'component.global.enable' })} valuePropName="checked" name="disable">
            <Switch
              defaultChecked={initialData[name] && !initialData[name].disable}
              disabled={readonly}
            />
          </Form.Item>
          {type === 'global' && (
            <Form.Item label={formatMessage({ id: 'component.global.scope' })} name="scope">
              <Select disabled>
                <Select.Option value="global">{formatMessage({ id: "other.global" })}</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
        <Divider orientation="left">{formatMessage({ id: 'component.global.data.editor' })}</Divider>
        <PageHeader
          title=""
          subTitle={
            pluginType === 'auth' && schemaType !== 'consumer' && (codeMirrorMode !== codeMirrorModeList.UIForm) ? (
              <Alert message={formatMessage({ id: 'component.plugin.noConfigurationRequired' })} type="warning" />
            ) : null
          }
          ghost={false}
          extra={[
            <Select
              defaultValue={codeMirrorModeList.JSON}
              value={codeMirrorMode}
              options={modeOptions}
              onChange={(value: PluginComponent.CodeMirrorMode) => {
                handleModeChange(value);
              }}
              data-cy='code-mirror-mode'
              key={1}
            ></Select>,
            <Tooltip title={formatMessage({ id: "component.plugin.format-codes.disable" })} key={2}>
              <Button type="primary" onClick={formatCodes} disabled={codeMirrorMode === codeMirrorModeList.UIForm}>
                {formatMessage({ id: 'component.global.format' })}
              </Button>
            </Tooltip>,
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
            </Button>
          ]}
        />
        {Boolean(codeMirrorMode === codeMirrorModeList.UIForm) && <PluginForm name={name} form={UIForm} renderForm={!(pluginType === 'auth' && schemaType !== 'consumer')} />}
        <div style={{ display: codeMirrorMode === codeMirrorModeList.UIForm ? 'none' : 'unset' }}><CodeMirror
          ref={(codemirror) => {
            ref.current = codemirror;
            if (codemirror) {
              // NOTE: for debug & test
              // @ts-ignore
              window.codemirror = codemirror.editor;
            }
          }}
          value={JSON.stringify(data, null, 2)}
          options={{
            mode: codeMirrorMode,
            readOnly: readonly ? 'nocursor' : '',
            lineWrapping: true,
            lineNumbers: true,
            showCursorWhenSelecting: true,
            autofocus: true,
          }} />
        </div>
      </Drawer>
    </>
  );
};

export default PluginDetail;

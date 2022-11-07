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
import { Button, Drawer, notification, PageHeader, Select, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useIntl } from 'umi';
import { js_beautify } from 'js-beautify';
import type { Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import type { languages } from 'monaco-editor';

import { json2yaml, yaml2json } from '../../helpers';

type Props = {
  visible: boolean;
  readonly: boolean;
  type: 'route' | 'service' | 'consumer' | 'upstream';
  data: Record<string, any>;
  onClose?: () => void;
  onSubmit?: (data: Record<string, any>) => void;
};

enum monacoLanguageList {
  JSON = 'JSON',
  YAML = 'YAML',
}

const RawDataEditor: React.FC<Props> = ({
  visible,
  readonly = true,
  type,
  data = {},
  onClose = () => {},
  onSubmit = () => {},
}) => {
  const { formatMessage } = useIntl();
  const [monacoLanguage, setMonacoLanguage] = useState<PluginComponent.MonacoLanguage>(
    monacoLanguageList.JSON,
  );
  const [content, setContent] = useState('');

  useEffect(() => {
    switch (monacoLanguage) {
      case monacoLanguageList.JSON:
        setContent(JSON.stringify(data, null, 2));
        break;
      case monacoLanguageList.YAML: {
        const { data: yamlData } = json2yaml(JSON.stringify(data, null, 2));
        setContent(yamlData);
        break;
      }
      default:
    }
  }, [data]);

  useEffect(() => {
    setMonacoLanguage(monacoLanguageList.JSON);
  }, [visible]);

  const modeOptions = [
    { label: monacoLanguageList.JSON, value: monacoLanguageList.JSON },
    { label: monacoLanguageList.YAML, value: monacoLanguageList.YAML },
  ];

  const handleModeChange = (value: PluginComponent.MonacoLanguage) => {
    switch (value) {
      case monacoLanguageList.JSON:
        setContent((c) => {
          const { data: jsonData, error } = yaml2json(c, true);
          if (error) {
            notification.error({ message: formatMessage({ id: 'component.global.invalidYaml' }) });
            return c;
          }
          return js_beautify(jsonData, { indent_size: 2 });
        });
        break;
      case monacoLanguageList.YAML:
        setContent((c) => {
          const { data: yamlData, error } = json2yaml(c);
          if (error) {
            notification.error({ message: formatMessage({ id: 'component.global.invalidJson' }) });
            return c;
          }
          return yamlData;
        });
        break;
      default:
        break;
    }
    setMonacoLanguage(value);
  };

  const formatYaml = (yaml: string): string => {
    const json = yaml2json(yaml, true);
    if (json.error) {
      return yaml;
    }
    return json2yaml(json.data).data;
  };

  const editorWillMount = (monaco: Monaco) => {
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
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      trailingCommas: 'error',
    });
  };

  return (
    <>
      <Drawer
        title={formatMessage({ id: 'component.global.data.editor' })}
        placement="right"
        width={700}
        visible={visible}
        onClose={onClose}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onClose} key={1}>
              {formatMessage({ id: 'component.global.cancel' })}
            </Button>
            <Space>
              <Button
                key={2}
                type="primary"
                onClick={() => {
                  try {
                    const editorData =
                      monacoLanguage === monacoLanguageList.JSON
                        ? JSON.parse(content)
                        : yaml2json(content, false).data;
                    onSubmit(editorData);
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
        <PageHeader
          title=""
          extra={[
            <Select
              key={'monaco-language'}
              defaultValue={monacoLanguageList.JSON}
              value={monacoLanguage}
              options={modeOptions}
              onChange={(value: PluginComponent.MonacoLanguage) => {
                handleModeChange(value);
              }}
              data-cy="monaco-language"
            />,
            <CopyToClipboard
              key={'copy'}
              text={content}
              onCopy={(_: string, result: boolean) => {
                if (!result) {
                  notification.error({
                    message: formatMessage({ id: 'component.global.copyFail' }),
                  });
                  return;
                }
                notification.success({
                  message: formatMessage({ id: 'component.global.copySuccess' }),
                });
              }}
            >
              <Button type="primary" key={2}>
                {formatMessage({ id: 'component.global.copy' })}
              </Button>
            </CopyToClipboard>,
            <Button
              type="default"
              icon={<LinkOutlined />}
              onClick={() => {
                window.open(`https://apisix.apache.org/docs/apisix/admin-api#${type}`);
              }}
              key={'document'}
            >
              {formatMessage({ id: 'component.global.document' })}
            </Button>,
          ]}
        />
        <Editor
          value={content}
          onChange={(text) => {
            if (text) {
              setContent(text);
            } else {
              setContent('');
            }
          }}
          onMount={(editor) => {
            // NOTE: for debug & test
            // @ts-ignore
            window.monacoEditor = editor;
          }}
          beforeMount={editorWillMount}
          language={monacoLanguage.toLocaleLowerCase()}
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
      </Drawer>
    </>
  );
};

export default RawDataEditor;

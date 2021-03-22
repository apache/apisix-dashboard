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
import { Button, Drawer, PageHeader, notification, Space, Select } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useIntl } from 'umi';
import { js_beautify } from 'js-beautify';

import { json2yaml, yaml2json } from '../../helpers';

type Props = {
  visible: boolean,
  readonly: boolean,
  type: 'route' | 'service' | 'consumer' | 'upstream'
  data: Record<string, any>,
  onClose?: () => void;
  onSubmit?: (data: Record<string, any>) => void;
};

enum codeMirrorModeList {
  Json = 'Json',
  Yaml = 'Yaml',
}

const RawDataEditor: React.FC<Props> = ({ visible, readonly = true, type, data = {}, onClose = () => { }, onSubmit = () => { } }) => {
  const ref = useRef<any>(null);
  const { formatMessage } = useIntl();
  const [codeMirrorMode, setCodeMirrorMode] = useState<PluginComponent.CodeMirrorMode>(
    codeMirrorModeList.Json,
  );

  useEffect(() => {
    setCodeMirrorMode(codeMirrorModeList.Json);
  }, [visible])

  const modeOptions = [
    { label: codeMirrorModeList.Json, value: codeMirrorModeList.Json },
    { label: codeMirrorModeList.Yaml, value: codeMirrorModeList.Yaml },
  ];

  const handleModeChange = (value: PluginComponent.CodeMirrorMode) => {
    switch (value) {
      case codeMirrorModeList.Json: {
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
        break;
      }
      case codeMirrorModeList.Yaml: {
        const { data: jsonData, error } = json2yaml(ref.current.editor.getValue());

        if (error) {
          notification.error({
            message: 'Invalid Json data',
          });
          return;
        }
        ref.current.editor.setValue(jsonData);
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
        title={formatMessage({ id: 'component.rawDataEditor.title' })}
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
                      codeMirrorMode === codeMirrorModeList.Json
                        ? JSON.parse(ref.current?.editor.getValue())
                        : yaml2json(ref.current?.editor.getValue(), false).data;
                    onSubmit(editorData);
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
        <PageHeader
          title=""
          extra={[
            <Button
              type="default"
              icon={<LinkOutlined />}
              onClick={() => {
                window.open(
                  `https://apisix.apache.org/docs/apisix/admin-api#${type}`,
                );
              }}
              key={1}
            >
              Document
            </Button>,
            <Select
              defaultValue={codeMirrorModeList.Json}
              value={codeMirrorMode}
              options={modeOptions}
              onChange={(value: PluginComponent.CodeMirrorMode) => {
                handleModeChange(value);
              }}
              data-cy='code-mirror-mode'
            ></Select>,
            <Button type="primary" onClick={formatCodes} key={2}>
              Format
            </Button>,
            <CopyToClipboard text={JSON.stringify(data)} onCopy={(_: string, result: boolean) => {
              if (!result) {
                notification.error({
                  message: 'Copy Failed',
                });
                return;
              }
              notification.success({
                message: 'Copy Successfully',
              });
            }}>
              <Button type="primary" key={2}>
                Copy
              </Button>
            </CopyToClipboard>,
          ]}
        />
        <CodeMirror
          ref={(codemirror) => {
            ref.current = codemirror;
            if (codemirror) {
              // NOTE: for debug & test
              window.codemirror = codemirror.editor;
            }
          }}
          value={JSON.stringify(data, null, 2)}
          options={{
            mode: 'json-ld',
            readOnly: readonly ? 'nocursor' : '',
            lineWrapping: true,
            lineNumbers: true,
            showCursorWhenSelecting: true,
            autofocus: true,
          }}
        />
      </Drawer>
    </>
  );
};

export default RawDataEditor;

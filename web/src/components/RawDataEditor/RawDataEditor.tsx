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

import { json2yaml, yaml2json } from '@/helpers';
import MonacoEditor from "react-monaco-editor";

type Props = {
  visible: boolean,
  readonly: boolean,
  type: 'route' | 'service' | 'consumer' | 'upstream'
  data: Record<string, any>,
  onClose?: () => void;
  onSubmit?: (data: Record<string, any>) => void;
};

enum codeMirrorModeList {
  JSON = 'JSON',
  YAML = 'YAML',
}

const RawDataEditor: React.FC<Props> = ({ visible, readonly = true, type, data = {}, onClose = () => { }, onSubmit = () => { } }) => {
  const { formatMessage } = useIntl();
  const [codeMirrorMode, setCodeMirrorMode] = useState<PluginComponent.CodeMirrorMode>(
    codeMirrorModeList.JSON,
  );
  const [content, setContent] = useState('')

  useEffect(() => {
    switch (codeMirrorMode) {
      case codeMirrorModeList.JSON:
        setContent(JSON.stringify(data, null, 4));
        break;
      case codeMirrorModeList.YAML: {
        const {data: yamlData} = json2yaml(JSON.stringify(data, null, 4));
        setContent(yamlData)
        break;
      }
      default:
    }
  }, [data])

  useEffect(() => {
    setCodeMirrorMode(codeMirrorModeList.JSON);
  }, [visible])

  const modeOptions = [
    { label: codeMirrorModeList.JSON, value: codeMirrorModeList.JSON },
    { label: codeMirrorModeList.YAML, value: codeMirrorModeList.YAML },
  ];

  const handleModeChange = (value: PluginComponent.CodeMirrorMode) => {
    switch (value) {
      case codeMirrorModeList.JSON:
        setContent(c => {
          const {data:jsonData,error} = yaml2json(c, true);
          if (error){
            notification.error({message: 'Invalid Yaml data'});
            return c;
          }
          return js_beautify(jsonData, {indent_size: 4});
        })
        break;
      case codeMirrorModeList.YAML:
        setContent(c => {
          const {data:yamlData,error} = json2yaml(c);
          if (error){
            notification.error({message: 'Invalid Json data'});
            return c;
          }
          return yamlData;
        });
        break;
      default:
    }
    setCodeMirrorMode(value)
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
                      codeMirrorMode === codeMirrorModeList.JSON
                        ? JSON.parse(content)
                        : yaml2json(content, false).data;
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
            <Select
              defaultValue={codeMirrorModeList.JSON}
              value={codeMirrorMode}
              options={modeOptions}
              onChange={(value: PluginComponent.CodeMirrorMode) => {
                handleModeChange(value);
              }}
              data-cy='code-mirror-mode'
            />,
            <CopyToClipboard text={content} onCopy={(_: string, result: boolean) => {
              if (!result) {
                notification.error({
                  message: formatMessage({ id: 'component.global.copyFail' }),
                });
                return;
              }
              notification.success({
                message: formatMessage({ id: 'component.global.copySuccess' }),
              });
            }}>
              <Button type="primary" key={2}>
                {formatMessage({ id: 'component.global.copy' })}
              </Button>
            </CopyToClipboard>,
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
              {formatMessage({ id: 'component.global.document' })}
            </Button>,
          ]}
        />
        <MonacoEditor
          ref={(codemirror) => {
            if (codemirror) {
              // NOTE: for debug & test
              // @ts-ignore
              window.codemirror = codemirror.editor;
            }
          }}
          value={content}
          onChange={setContent}
          language={codeMirrorMode.toLocaleLowerCase()}
          options={{
            scrollbar:{
              vertical: 'hidden',
              horizontal: 'hidden',
            },
            wordWrap: "on",
            minimap: {enabled: false},
            readOnly: readonly,
          }}
        />
      </Drawer>
    </>
  );
};

export default RawDataEditor;

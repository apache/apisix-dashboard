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
import React, { useRef } from 'react';
import { Button, Drawer, PageHeader, Tooltip, notification } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useIntl } from 'umi';

type Props = {
  visible: boolean,
  readonly: boolean,
  type: 'route' | 'service' | 'consumer' | 'upstream'
  data: Record<string, any>,
  onClose?: () => void;
};

const RawDataEditor: React.FC<Props> = ({ visible, readonly = true, type, data = {}, onClose }) => {
  const ref = useRef<any>(null);
  const { formatMessage } = useIntl();

  return (
    <>
      <Drawer
        title={formatMessage({ id: 'component.rawDataEditor.title' })}
        placement="right"
        width={700}
        visible={visible}
        onClose={onClose}
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
            <Tooltip placement="top" title={formatMessage({ id: 'component.rawDataEditor.tip' })}>
              <Button type="primary" onClick={() => { }} key={2}>
                Format
            </Button>
            </Tooltip>,
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

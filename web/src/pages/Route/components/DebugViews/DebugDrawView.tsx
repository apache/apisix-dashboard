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
import React, { useEffect, useState, useRef } from 'react';
import { Input, Select, Card, Tabs, Form, Drawer, Spin, notification, Radio } from 'antd';
import { useIntl } from 'umi';
import CodeMirror from '@uiw/react-codemirror';
import { PanelSection } from '@api7-dashboard/ui';
import queryString from 'query-string';
import Base64 from 'base-64';

import {
  HTTP_METHOD_OPTION_LIST,
  DEFAULT_DEBUG_PARAM_FORM_DATA,
  DEFAULT_DEBUG_AUTH_FORM_DATA,
  PROTOCOL_SUPPORTED,
  DEBUG_BODY_TYPE_SUPPORTED,
  DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED,
} from '../../constants';
import { DebugParamsView, AuthenticationView } from '.';
import { debugRoute } from '../../service';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const DebugDrawView: React.FC<RouteModule.DebugDrawProps> = (props) => {
  const { formatMessage } = useIntl();
  const [httpMethod, setHttpMethod] = useState(HTTP_METHOD_OPTION_LIST[0]);
  const [requestProtocol, setRequestProtocol] = useState(PROTOCOL_SUPPORTED[0]);
  const [showBodyTab, setShowBodyTab] = useState(false);
  const [queryForm] = Form.useForm();
  const [bodyForm] = Form.useForm();
  const [authForm] = Form.useForm();
  const [headerForm] = Form.useForm();
  const [responseCode, setResponseCode] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [codeMirrorHeight, setCodeMirrorHeight] = useState<number | string>(50);
  const bodyCodeMirrorRef = useRef<any>(null);
  const [bodyType, setBodyType] = useState('none');
  const methodWithoutBody = ['GET', 'HEAD'];
  const [bodyCodeMirrorMode, setBodyCodeMirrorMode] = useState(
    DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[0].mode,
  );

  enum DebugBodyType {
    None = 0,
    FormUrlencoded,
    Json,
    RawInput,
  }

  const resetForms = () => {
    queryForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    bodyForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    headerForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    authForm.setFieldsValue(DEFAULT_DEBUG_AUTH_FORM_DATA);
    setResponseCode(`${formatMessage({ id: 'page.route.debug.showResultAfterSendRequest' })}`);
    setBodyType(DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.None]);
  };

  useEffect(() => {
    resetForms();
  }, []);

  const transformBodyParamsFormData = () => {
    let transformDataForm: string[];
    let transformDataJson: Record<string, any>;
    const formData: RouteModule.debugRequestParamsFormData[] = bodyForm.getFieldsValue().params;
    if (methodWithoutBody.includes(httpMethod)) {
      return undefined;
    }
    switch (bodyType) {
      case 'x-www-form-urlencoded':
        transformDataForm = (formData || [])
          .filter((data) => data.check)
          .map((data) => {
            return `${data.key}=${data.value}`;
          });

        return transformDataForm.join('&');
      case 'json':
        transformDataJson = {};
        (formData || [])
          .filter((data) => data.check)
          .forEach((data) => {
            transformDataJson = {
              ...transformDataJson,
              [data.key]: data.value,
            };
          });

        return JSON.stringify(transformDataJson);
      case 'raw input':
        return bodyCodeMirrorRef.current.editor.getValue();
      case 'none':
      default:
        return undefined;
    }
  };

  const transformHeaderAndQueryParamsFormData = (
    formData: RouteModule.debugRequestParamsFormData[],
  ) => {
    let transformData = {};
    (formData || [])
      .filter((data) => data && data.check)
      .forEach((data) => {
        transformData = {
          ...transformData,
          [data.key]: [...(transformData[data.key] || []), data.value],
        };
      });

    return transformData;
  };

  const transformAuthFormData = (formData: RouteModule.authData, headerData: any) => {
    const { authType } = formData;

    switch (authType) {
      case 'basic-auth':
        return {
          ...headerData,
          Authorization: [`Basic ${Base64.encode(`${formData.username}:${formData.password}`)}`],
        };
      case 'jwt-auth':
        return {
          ...headerData,
          Authorization: [formData.Authorization],
        };
      case 'key-auth':
        return {
          ...headerData,
          apikey: [formData.apikey],
        };
      default:
        break;
    }

    return headerData;
  };

  const handleDebug = (url: string) => {
    /* eslint-disable no-useless-escape */
    const urlReg = /^(?=^.{3,255}$)(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w*)*(\.\w+)*([\?&]\w+=\w*)*$/;
    if (!urlReg.test(url)) {
      notification.warning({
        message: formatMessage({ id: 'page.route.input.placeholder.requestUrl' }),
      });
      return;
    }
    const queryFormData = transformHeaderAndQueryParamsFormData(queryForm.getFieldsValue().params);
    const bodyFormData = transformBodyParamsFormData();
    const pureHeaderFormData = transformHeaderAndQueryParamsFormData(
      headerForm.getFieldsValue().params,
    );
    const headerFormData = transformAuthFormData(authForm.getFieldsValue(), pureHeaderFormData);
    const urlQueryString = queryString.stringify(queryFormData);

    setLoading(true);
    // TODO: grpc and websocket
    debugRoute({
      url: `${requestProtocol}://${url}${urlQueryString && `?${urlQueryString}`}`,
      request_protocol: requestProtocol,
      method: httpMethod,
      body_params: bodyFormData,
      header_params: headerFormData,
    })
      .then((req) => {
        setLoading(false);
        setResponseCode(JSON.stringify(req.data.data, null, 2));
        setCodeMirrorHeight('auto');
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return (
    <Drawer
      title={formatMessage({ id: 'page.route.onlineDebug' })}
      mask={false}
      maskClosable={false}
      visible={props.visible}
      width={650}
      onClose={() => {
        props.onClose();
      }}
      className={styles.routeDebugDraw}
    >
      <Card bordered={false}>
        <Input.Group compact>
          <Select
            defaultValue={httpMethod}
            style={{ width: '20%' }}
            onChange={(value) => {
              setHttpMethod(value);
              setShowBodyTab(!(methodWithoutBody.indexOf(value) > -1));
            }}
            size="large"
          >
            {HTTP_METHOD_OPTION_LIST.map((method) => {
              return (
                <Option key={method} value={method}>
                  {method}
                </Option>
              );
            })}
          </Select>
          <Select
            defaultValue={requestProtocol}
            style={{ width: '18%' }}
            onChange={(value) => {
              setRequestProtocol(value);
            }}
            size="large"
          >
            {PROTOCOL_SUPPORTED.map((protocol) => {
              return (
                <Option key={protocol} value={protocol}>
                  {`${protocol}://`}
                </Option>
              );
            })}
          </Select>
          <Search
            placeholder={formatMessage({ id: 'page.route.input.placeholder.requestUrl' })}
            allowClear
            enterButton={formatMessage({ id: 'page.route.button.send' })}
            size="large"
            style={{ width: '62%' }}
            onSearch={handleDebug}
            onPressEnter={(e) => {
              handleDebug(e.currentTarget.value);
            }}
            onChange={(e) => {
              if (e.currentTarget.value === '') {
                resetForms();
                setCodeMirrorHeight(50);
              }
            }}
          />
        </Input.Group>
        <PanelSection
          title={formatMessage({ id: 'page.route.PanelSection.title.defineRequestParams' })}
        >
          <Tabs>
            <TabPane tab={formatMessage({ id: 'page.route.TabPane.queryParams' })} key="query">
              <DebugParamsView form={queryForm} />
            </TabPane>
            <TabPane tab={formatMessage({ id: 'page.route.TabPane.authentication' })} key="auth">
              <AuthenticationView form={authForm} />
            </TabPane>
            <TabPane tab={formatMessage({ id: 'page.route.TabPane.headerParams' })} key="header">
              <DebugParamsView form={headerForm} />
            </TabPane>
            {showBodyTab && (
              <TabPane tab={formatMessage({ id: 'page.route.TabPane.bodyParams' })} key="body">
                <Radio.Group
                  onChange={(e) => {
                    setBodyType(e.target.value);
                  }}
                  value={bodyType}
                >
                  {DEBUG_BODY_TYPE_SUPPORTED.map((type) => (
                    <Radio value={type} key={type}>
                      {type}
                    </Radio>
                  ))}
                </Radio.Group>
                {bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.RawInput] && (
                  <Select
                    size="small"
                    onChange={(value) => {
                      setBodyCodeMirrorMode(value);
                    }}
                    style={{ width: 100 }}
                    defaultValue={bodyCodeMirrorMode}
                  >
                    {DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED.map((modeObj) => (
                      <Select.Option key={modeObj.name} value={modeObj.mode}>
                        {modeObj.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                <div style={{ marginTop: 16 }}>
                  {(bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormUrlencoded] ||
                    bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.Json]) && (
                    <DebugParamsView form={bodyForm} />
                  )}

                  {bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.RawInput] && (
                    <Form>
                      <Form.Item>
                        <CodeMirror
                          ref={bodyCodeMirrorRef}
                          height={250}
                          options={{
                            mode: bodyCodeMirrorMode,
                            readOnly: '',
                            lineWrapping: true,
                            lineNumbers: true,
                            showCursorWhenSelecting: true,
                            autofocus: true,
                            scrollbarStyle: null,
                          }}
                        />
                      </Form.Item>
                    </Form>
                  )}
                </div>
              </TabPane>
            )}
          </Tabs>
        </PanelSection>
        <PanelSection title={formatMessage({ id: 'page.route.PanelSection.title.responseResult' })}>
          <Tabs>
            <TabPane tab={formatMessage({ id: 'page.route.TabPane.response' })} key="response">
              <Spin tip="Loading..." spinning={loading}>
                <CodeMirror
                  value={responseCode}
                  height={codeMirrorHeight}
                  options={{
                    mode: 'json-ld',
                    readOnly: 'nocursor',
                    lineWrapping: true,
                    lineNumbers: true,
                    showCursorWhenSelecting: true,
                    autofocus: true,
                    scrollbarStyle: null,
                  }}
                />
              </Spin>
            </TabPane>
          </Tabs>
        </PanelSection>
      </Card>
    </Drawer>
  );
};

export default DebugDrawView;

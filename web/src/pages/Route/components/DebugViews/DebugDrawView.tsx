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
import urlRegexSafe from 'url-regex-safe';

import {
  HTTP_METHOD_OPTION_LIST,
  DEFAULT_DEBUG_PARAM_FORM_DATA,
  DEFAULT_DEBUG_AUTH_FORM_DATA,
  PROTOCOL_SUPPORTED,
  DEBUG_BODY_TYPE_SUPPORTED,
  DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED,
  DebugBodyFormDataValueType,
} from '../../constants';
import { DebugParamsView, AuthenticationView, DebugFormDataView } from '.';
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
  const [urlencodedForm] = Form.useForm();
  const [formDataForm] = Form.useForm();
  const [authForm] = Form.useForm();
  const [headerForm] = Form.useForm();
  const [responseBody, setResponseBody] = useState<string>();
  const [responseHeader, setResponseHeader] = useState<string>();
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
    FormData,
    RawInput,
  }

  const resetForms = () => {
    queryForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    urlencodedForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    formDataForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    headerForm.setFieldsValue(DEFAULT_DEBUG_PARAM_FORM_DATA);
    authForm.setFieldsValue(DEFAULT_DEBUG_AUTH_FORM_DATA);
    setResponseBody(formatMessage({ id: 'page.route.debug.showResultAfterSendRequest' }));
    setResponseHeader(formatMessage({ id: 'page.route.debug.showResultAfterSendRequest' }));
    setBodyType(DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.None]);
  };

  useEffect(() => {
    resetForms();
  }, []);

  const transformBodyParamsFormData = () => {
    if (methodWithoutBody.includes(httpMethod)) {
      return {
        bodyFormData: undefined,
      };
    }

    switch (bodyType) {
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormUrlencoded]: {
        let transformFormUrlencoded: string[] = [];
        const FormUrlencodedData: RouteModule.debugRequestParamsFormData[] = urlencodedForm.getFieldsValue().params;
        transformFormUrlencoded = (FormUrlencodedData || [])
          .filter((data) => data && data.check)
          .map((data) => {
            return `${data.key}=${data.value}`;
          });

        return {
          bodyFormData: transformFormUrlencoded.join('&'),
          header: {
            'Content-type': ['application/x-www-form-urlencoded;charset=UTF-8']
          }
        }
      }
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.RawInput]:{
        let contentType = [''];
        switch (bodyCodeMirrorMode){
          case DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[0].mode:
            contentType = ['application/json;charset=UTF-8'];
            break;
          case DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[1].mode:
            contentType = ['text/plain;charset=UTF-8'];
            break;
          case DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[2].mode:
            contentType = ['application/xml;charset=UTF-8'];
            break;
          default: break;
        }

        return {
          bodyFormData: bodyCodeMirrorRef.current.editor.getValue(),
          header: {
            'Content-type': contentType
          }
        }
      }
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormData]: {
        const transformFormData = new FormData();
        const formDataData: RouteModule.debugRequestParamsFormData[] = formDataForm.getFieldsValue().params;

        (formDataData || [])
          .filter((data) => data && data.check)
          .forEach((data) => {
            if (data.type === DebugBodyFormDataValueType.File) {
              transformFormData.append(data.key, data.value.originFileObj)
            } else {
              transformFormData.append(data.key, data.value)
            }
          })
        return {
          bodyFormData: transformFormData,
        }
      }
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.None]:
      default:
        return {
          bodyFormData: undefined,
        };
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

  const transformAuthFormData = (formData: RouteModule.authData, userHeaderData: any, formHeaderData: any) => {
    const { authType } = formData;

    switch (authType) {
      case 'basic-auth':
        return {
          ...formHeaderData,
          ...userHeaderData,
          Authorization: [`Basic ${Base64.encode(`${formData.username}:${formData.password}`)}`],
        };
      case 'jwt-auth':
        return {
          ...formHeaderData,
          ...userHeaderData,
          Authorization: [formData.Authorization],
        };
      case 'key-auth':
        return {
          ...formHeaderData,
          ...userHeaderData,
          apikey: [formData.apikey],
        };
      default:
        break;
    }

    return {
      ...formHeaderData,
      ...userHeaderData,
    }
  };

  const handleDebug = (url: string) => {
    /* eslint-disable no-useless-escape */
    if (!urlRegexSafe({exact: true, strict: false}).test(url)) {
      notification.warning({
        message: formatMessage({ id: 'page.route.input.placeholder.requestUrl' }),
      });
      return;
    }
    const queryFormData = transformHeaderAndQueryParamsFormData(queryForm.getFieldsValue().params);
    const bodyFormRelateData = transformBodyParamsFormData();
    const {bodyFormData, header: bodyFormHeader} = bodyFormRelateData;
    const pureHeaderFormData = transformHeaderAndQueryParamsFormData(
      headerForm.getFieldsValue().params,
    );
    const headerFormData = transformAuthFormData(authForm.getFieldsValue(), pureHeaderFormData, bodyFormHeader);
    const urlQueryString = url.indexOf('?') === -1 ? `?${queryString.stringify(queryFormData)}` : `&${queryString.stringify(queryFormData)}`

    setLoading(true);
    // TODO: grpc and websocket
    debugRoute({
      online_debug_header_params: JSON.stringify(headerFormData),
      online_debug_url: `${requestProtocol}://${url}${urlQueryString}`,
      online_debug_request_protocol: requestProtocol,
      online_debug_method: httpMethod,
    }, bodyFormData)
      .then((req) => {
        setLoading(false);
        setResponseBody(JSON.stringify(req.data.data, null, 2));
        setResponseHeader(JSON.stringify(req.data.header, null, 2));
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
      data-cy='debug-draw'
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
            data-cy='debug-method'
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
            data-cy='debug-protocol'
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
            id="debugUri"
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
            <TabPane data-cy='query' tab={formatMessage({ id: 'page.route.TabPane.queryParams' })} key="query">
              <DebugParamsView form={queryForm} name='queryForm'/>
            </TabPane>
            <TabPane data-cy='auth' tab={formatMessage({ id: 'page.route.TabPane.authentication' })} key="auth">
              <AuthenticationView form={authForm} />
            </TabPane>
            <TabPane data-cy='header' tab={formatMessage({ id: 'page.route.TabPane.headerParams' })} key="header">
              <DebugParamsView form={headerForm} name='headerForm' inputType="header"/>
            </TabPane>
            {showBodyTab && (
              <TabPane data-cy='body' tab={formatMessage({ id: 'page.route.TabPane.bodyParams' })} key="body">
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
                      <Option key={modeObj.name} value={modeObj.mode}>
                        {modeObj.name}
                      </Option>
                    ))}
                  </Select>
                )}
                <div style={{ marginTop: 16 }}>
                  {bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormUrlencoded] && (
                    <DebugParamsView form={urlencodedForm} name='urlencodedForm'/>
                  )}

                  {bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormData] && (
                    <DebugFormDataView form={formDataForm} />
                  )}

                  {bodyType === DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.RawInput] && (
                    <Form>
                      <Form.Item>
                        <CodeMirror
                          ref={(codemirror) => {
                            bodyCodeMirrorRef.current = codemirror;
                            if (codemirror) {
                              // NOTE: for debug & test
                              window.codeMirrorBody = codemirror.editor;
                            }
                          }}
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
                <div id='codeMirror-response'>
                  <CodeMirror
                    value={responseBody}
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
                </div>
              </Spin>
            </TabPane>
            <TabPane tab={formatMessage({ id: 'page.route.TabPane.header' })} key="header">
              <Spin tip="Loading..." spinning={loading}>
                <CodeMirror
                  value={responseHeader}
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

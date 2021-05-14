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
import { Button, Card, Drawer, Form, notification, Radio, Select, Spin, Tabs } from 'antd';
import { useIntl } from 'umi';
import CodeMirror from '@uiw/react-codemirror';
import queryString from 'query-string';
import Base64 from 'base-64';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';

import PanelSection from '@/components/PanelSection';

import {
  DEFAULT_DEBUG_PARAM_FORM_DATA,
  DEFAULT_DEBUG_AUTH_FORM_DATA,
  DEBUG_BODY_TYPE_SUPPORTED,
  DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED,
  DEBUG_RESPONSE_BODY_CODEMIRROR_MODE_SUPPORTED,
  DebugBodyFormDataValueType,
} from '../../constants';
import { DebugParamsView, AuthenticationView, DebugFormDataView, DebugTargetView } from '.';
import { debugRoute, getDebugTarget } from '../../service';
import styles from './index.less';

const { Option } = Select;
const { TabPane } = Tabs;

const DebugDrawView: React.FC<RouteModule.DebugDrawProps> = (props) => {
  const { formatMessage } = useIntl();
  const [requestTargetList, setRequestTargetList] = useState<string[]>([]);
  const [targetForm] = Form.useForm();
  const [showBodyTab, setShowBodyTab] = useState(false);
  const [queryForm] = Form.useForm();
  const [urlencodedForm] = Form.useForm();
  const [formDataForm] = Form.useForm();
  const [authForm] = Form.useForm();
  const [headerForm] = Form.useForm();
  const [response, setResponse] = useState<RouteModule.debugResponse | null>();
  const [loading, setLoading] = useState(false);
  const [codeMirrorHeight, setCodeMirrorHeight] = useState<number | string>(50);
  const bodyCodeMirrorRef = useRef<any>(null);
  const [bodyType, setBodyType] = useState('none');
  const [responseBodyCodeMirrorMode, setResponseBodyCodeMirrorMode] = useState(
    DEBUG_RESPONSE_BODY_CODEMIRROR_MODE_SUPPORTED[0].mode,
  );
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
    setResponse(null);
    setBodyType(DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.None]);
  };

  useEffect(() => {
    resetForms();
    getDebugTarget().then((resp) => {
      setRequestTargetList(resp.data);
    });
  }, []);

  const transformBodyParamsFormData = () => {
    if (!showBodyTab) {
      return {
        bodyFormData: undefined,
      };
    }

    switch (bodyType) {
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormUrlencoded]: {
        let transformFormUrlencoded: string[] = [];
        const FormUrlencodedData: RouteModule.debugRequestParamsFormData[] = urlencodedForm.getFieldsValue()
          .params;
        transformFormUrlencoded = (FormUrlencodedData || [])
          .filter((data) => data && data.check)
          .map((data) => {
            return `${data.key}=${data.value}`;
          });

        return {
          bodyFormData: transformFormUrlencoded.join('&'),
          header: {
            'Content-type': ['application/x-www-form-urlencoded;charset=UTF-8'],
          },
        };
      }
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.RawInput]: {
        let contentType = [''];
        switch (bodyCodeMirrorMode) {
          case DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[0].mode:
            contentType = ['application/json;charset=UTF-8'];
            break;
          case DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[1].mode:
            contentType = ['text/plain;charset=UTF-8'];
            break;
          case DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED[2].mode:
            contentType = ['application/xml;charset=UTF-8'];
            break;
          default:
            break;
        }

        return {
          bodyFormData: bodyCodeMirrorRef.current.editor.getValue(),
          header: {
            'Content-type': contentType,
          },
        };
      }
      case DEBUG_BODY_TYPE_SUPPORTED[DebugBodyType.FormData]: {
        const transformFormData = new FormData();
        const formDataData: RouteModule.debugRequestParamsFormData[] = formDataForm.getFieldsValue()
          .params;

        (formDataData || [])
          .filter((data) => data && data.check)
          .forEach((data) => {
            if (data.type === DebugBodyFormDataValueType.File) {
              transformFormData.append(data.key, data.value.originFileObj);
            } else {
              transformFormData.append(data.key, data.value);
            }
          });
        return {
          bodyFormData: transformFormData,
        };
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

  const transformAuthFormData = (
    formData: RouteModule.authData,
    userHeaderData: any,
    formHeaderData: any,
  ) => {
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
    };
  };

  const handleDebug = () => {
    targetForm
      .validateFields()
      .then((formValues) => {
        const { method, requestTarget, path, protocol } = formValues;
        const queryFormData = transformHeaderAndQueryParamsFormData(
          queryForm.getFieldsValue().params,
        );
        const bodyFormRelateData = transformBodyParamsFormData();
        const { bodyFormData, header: bodyFormHeader } = bodyFormRelateData;
        const pureHeaderFormData = transformHeaderAndQueryParamsFormData(
          headerForm.getFieldsValue().params,
        );
        const headerFormData = transformAuthFormData(
          authForm.getFieldsValue(),
          pureHeaderFormData,
          bodyFormHeader,
        );
        const urlQueryString =
          requestTarget.indexOf('?') === -1
            ? `?${queryString.stringify(queryFormData)}`
            : `&${queryString.stringify(queryFormData)}`;

        setLoading(true);
        // TODO: grpc and websocket
        debugRoute(
          {
            online_debug_header_params: JSON.stringify(headerFormData),
            online_debug_url: `${protocol}://${requestTarget}${path}${urlQueryString}`,
            online_debug_request_protocol: protocol,
            online_debug_method: method,
          },
          bodyFormData,
        )
          .then((req) => {
            setLoading(false);
            const resp: RouteModule.debugResponse = req.data;
            if (typeof resp.data !== 'string') {
              resp.data = JSON.stringify(resp.data, null, 2);
            }
            setResponse(resp);
            const contentType = resp.header['Content-Type'];
            if (contentType == null || contentType.length !== 1) {
              setResponseBodyCodeMirrorMode('TEXT');
            } else if (contentType[0].toLowerCase().indexOf('json') !== -1) {
              setResponseBodyCodeMirrorMode('JSON');
            } else if (contentType[0].toLowerCase().indexOf('xml') !== -1) {
              setResponseBodyCodeMirrorMode('XML');
            } else if (contentType[0].toLowerCase().indexOf('html') !== -1) {
              setResponseBodyCodeMirrorMode('HTML');
            } else {
              setResponseBodyCodeMirrorMode('TEXT');
            }
            setCodeMirrorHeight('auto');
          })
          .catch(() => {
            setLoading(false);
          });
      })
      .catch(() => {
        notification.warning({
          message: formatMessage({ id: 'page.route.debug.path.rules.required.description' }),
        });
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
      data-cy="debug-draw"
    >
      <Card bordered={false}>
        <DebugTargetView form={targetForm} requestTargetList={requestTargetList} setShowBodyTab={setShowBodyTab}/>
        <PanelSection
          title={formatMessage({ id: 'page.route.PanelSection.title.defineRequestParams' })}
        >
          <Tabs>
            <TabPane
              data-cy="query"
              tab={formatMessage({ id: 'page.route.TabPane.queryParams' })}
              key="query"
            >
              <DebugParamsView form={queryForm} name="queryForm" />
            </TabPane>
            <TabPane
              data-cy="auth"
              tab={formatMessage({ id: 'page.route.TabPane.authentication' })}
              key="auth"
            >
              <AuthenticationView form={authForm} />
            </TabPane>
            <TabPane
              data-cy="header"
              tab={formatMessage({ id: 'page.route.TabPane.headerParams' })}
              key="header"
            >
              <DebugParamsView form={headerForm} name="headerForm" inputType="header" />
            </TabPane>
            {showBodyTab && (
              <TabPane
                data-cy="body"
                tab={formatMessage({ id: 'page.route.TabPane.bodyParams' })}
                key="body"
              >
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
                    <DebugParamsView form={urlencodedForm} name="urlencodedForm" />
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
        <Button type="primary" block onClick={handleDebug}>
          {formatMessage({ id: 'page.route.button.send' })}
        </Button>
        <PanelSection title={formatMessage({ id: 'page.route.PanelSection.title.responseResult' })}>
          <Spin tip="Loading..." spinning={loading}>
            <Tabs
              tabBarExtraContent={
                response
                  ? response.message
                  : formatMessage({ id: 'page.route.debug.showResultAfterSendRequest' })
              }
            >
              <TabPane tab={formatMessage({ id: 'page.route.TabPane.response' })} key="response">
                <Select
                  disabled={response == null}
                  value={responseBodyCodeMirrorMode}
                  onSelect={(mode) => setResponseBodyCodeMirrorMode(mode as string)}
                >
                  {DEBUG_RESPONSE_BODY_CODEMIRROR_MODE_SUPPORTED.map((mode) => {
                    return (
                      <Option value={mode.mode} key={mode.mode}>
                        {mode.name}
                      </Option>
                    );
                  })}
                </Select>
                <CopyToClipboard
                  text={response ? response.data : ''}
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
                  <Button type="text" disabled={!response}>
                    <CopyOutlined />
                  </Button>
                </CopyToClipboard>
                <div id="codeMirror-response" style={{ marginTop: 16 }}>
                  <CodeMirror
                    value={response ? response.data : ''}
                    height={codeMirrorHeight}
                    options={{
                      mode: responseBodyCodeMirrorMode,
                      readOnly: 'nocursor',
                      lineWrapping: true,
                      lineNumbers: true,
                      showCursorWhenSelecting: true,
                      autofocus: true,
                      scrollbarStyle: null,
                    }}
                  />
                </div>
              </TabPane>
              <TabPane tab={formatMessage({ id: 'page.route.TabPane.header' })} key="header">
                {response &&
                  Object.keys(response.header).map((header) => {
                    return response.header[header].map((value) => {
                      return (
                        <div>
                          <b>{header}</b>: {value}
                        </div>
                      );
                    });
                  })}
              </TabPane>
            </Tabs>
          </Spin>
        </PanelSection>
      </Card>
    </Drawer>
  );
};

export default DebugDrawView;

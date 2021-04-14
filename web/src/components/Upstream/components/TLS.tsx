import React from 'react'
import { Form, Row, Col, Select, FormInstance, Input } from 'antd'
import { useIntl } from 'umi'

type Props = {
  form: FormInstance;
  readonly?: boolean;
}

const CUSTOM_FIELD_KEY = "custom__enable_tls"

const TLSComponent: React.FC<Props> = ({ form, readonly }) => {
  const { formatMessage } = useIntl()

  return (
    <React.Fragment>
      <Form.Item
        label="启用 TLS"
        tooltip="上游 TLS"
        style={{ marginBottom: 0 }}
      >
        <Row>
          <Col span={5}>
            <Form.Item
              name={CUSTOM_FIELD_KEY}
              initialValue="disable"
            >
              <Select disabled={readonly}>
                {
                  ["enable", "disable"].map(item => (
                    <Select.Option value={item} key={item}>
                      {formatMessage({ id: `component.global.${item}` })}
                    </Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return prev[CUSTOM_FIELD_KEY] !== next[CUSTOM_FIELD_KEY]
        }}
      >
        {
          () => {
            if (form.getFieldValue(CUSTOM_FIELD_KEY) === 'enable') {
              return (
                <React.Fragment>
                  <Form.Item
                    label={formatMessage({ id: 'component.upstream.fields.tls.client_cert' })}
                    name={["tls", "client_cert"]}
                    required
                    rules={[{ required: true, message: "" }, { max: 64 * 1024 }, { min: 128 }]}
                  >
                    <Input.TextArea disabled={readonly} minLength={128} maxLength={64 * 1024} rows={5} placeholder="请输入客户端证书" />
                  </Form.Item>
                  <Form.Item
                    label={formatMessage({ id: 'component.upstream.fields.tls.client_key' })}
                    name={["tls", "client_key"]}
                    required
                    rules={[{ required: true, message: "" }, { max: 64 * 1024 }, { min: 128 }]}
                  >
                    <Input.TextArea disabled={readonly} minLength={128} maxLength={64 * 1024} rows={5} placeholder="请输入客户端私钥" />
                  </Form.Item>
                </React.Fragment>
              )
            }
            return null
          }
        }
      </Form.Item>
    </React.Fragment>
  )
}

export default TLSComponent

import React from 'react'
import { Form, Switch } from 'antd'
import { useIntl } from 'umi'

type Props = {
  readonly?: boolean
}

const HttpsVerifyCertificateComponent: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl()
  return (
    <Form.Item
      label={formatMessage({ id: 'component.upstream.fields.checks.active.https_verify_certificate' })}
      name="https_verify_certificate"
      tooltip={formatMessage({ id: 'component.upstream.fields.checks.active.https_verify_certificate.tooltip' })}
      initialValue={true}
      valuePropName="checked"
    >
      <Switch disabled={readonly} />
    </Form.Item>
  )
}

export default HttpsVerifyCertificateComponent

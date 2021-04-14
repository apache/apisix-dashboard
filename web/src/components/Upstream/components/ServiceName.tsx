import React from 'react'
import { Form, Input } from 'antd'
import { useIntl } from 'umi'

type Props = {
  readonly?: boolean;
}

const ServiceName: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl()
  return (
    <Form.Item name="service_name" label={formatMessage({ id: 'component.upstream.fields.service_name' })} tooltip={formatMessage({ id: 'component.upstream.fields.service_name.tooltip' })}>
      <Input disabled={readonly} placeholder={formatMessage({ id: 'component.upstream.fields.service_name.placeholder' })} />
    </Form.Item>
  )
}

export default ServiceName

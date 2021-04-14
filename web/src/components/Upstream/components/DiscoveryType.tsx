import React from 'react'
import { Form, Input } from 'antd'
import { useIntl } from 'umi'

type Props = {
  readonly?: boolean;
}

const DiscoveryType: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl()
  return (
    <Form.Item name="discovery_type" label={formatMessage({ id: 'component.upstream.fields.discovery_type' })} tooltip={formatMessage({ id: 'component.upstream.fields.discovery_type.tooltip' })}>
      <Input disabled={readonly} placeholder={formatMessage({ id: 'component.upstream.fields.discovery_type.placeholder' })} />
    </Form.Item>
  )
}

export default DiscoveryType

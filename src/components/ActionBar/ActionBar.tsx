import React, { CSSProperties } from 'react';
import { Row, Col, Button } from 'antd';
import { useIntl } from 'umi';

interface Props {
  step: number;
  lastStep: number;
  onChange(nextStep: number): void;
  withResultView?: boolean;
}

const style: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 10,
  margin: '-24px -24px 0',
  backgroundColor: '#fff',
  padding: '6px 36px',
  borderTop: '1px solid #ebecec',
  width: '100%',
};

const ActionBar: React.FC<Props> = ({ step, lastStep, onChange, withResultView }) => {

  const { formatMessage } = useIntl();

  if (step > lastStep && !withResultView) {
    onChange(lastStep);
    return null;
  }

  return (
    <div style={style}>
      <Row gutter={10} justify="end">
        <Col>
          <Button type="primary" onClick={() => onChange(step - 1)} disabled={step === 1}>
            {formatMessage({ id: 'actionbar.last.step' })}
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={() => onChange(step + 1)}>
            {step < lastStep ? formatMessage({ id: 'actionbar.next.step' }) : formatMessage({ id: 'actionbar.submit' })}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ActionBar;

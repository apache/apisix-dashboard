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
import React from 'react';
import type { CSSProperties } from 'react';
import { Row, Col, Button } from 'antd';
import { useIntl } from 'umi';

type Props = {
  step: number;
  lastStep: number;
  onChange: (nextStep: number) => void;
  withResultView?: boolean;
  loading?: boolean;
};

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

const ActionBar: React.FC<Props> = ({ step, lastStep, onChange, withResultView, loading }) => {
  const { formatMessage } = useIntl();

  if (step > lastStep && !withResultView) {
    onChange(lastStep);
    return null;
  }

  // resultView should not show actionbar
  if (step > lastStep && withResultView) {
    return null;
  }

  return (
    <div style={style}>
      <Row gutter={10} justify="end">
        <Col>
          <Button type="primary" onClick={() => onChange(step - 1)} disabled={step === 1}>
            {formatMessage({ id: 'component.actionbar.button.preStep' })}
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={() => onChange(step + 1)} loading={loading}>
            {step < lastStep
              ? formatMessage({ id: 'component.actionbar.button.nextStep' })
              : formatMessage({ id: 'component.global.submit' })}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ActionBar;

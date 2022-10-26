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
import { Col, Form, Row, Switch } from 'antd';
import React, { memo } from 'react';

import { useIntl } from '@@/plugin-locale/localeExports';

const DataLoaderOpenAPI3: React.FC = () => {
  const { formatMessage } = useIntl();

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          name="merge_method"
          label={formatMessage({ id: 'page.route.data_loader.labels.openapi3_merge_method' })}
          tooltip={formatMessage({ id: 'page.route.data_loader.tips.openapi3_merge_method' })}
          initialValue={true}
        >
          <Switch defaultChecked />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default memo(DataLoaderOpenAPI3);

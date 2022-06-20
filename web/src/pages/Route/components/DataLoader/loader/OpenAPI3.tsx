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
import { Col, Form, Row, Switch } from 'antd';

const DataLoaderOpenAPI3: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          name="merge_method"
          label="Merge HTTP Methods"
          tooltip="Whether to merge multiple HTTP methods in the OpenAPI path into a single route. When you have multiple HTTP methods in your path with different details configuration (e.g. securitySchema), you can turn off this option to generate them into multiple routes."
          initialValue={true}
        >
          <Switch defaultChecked />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default DataLoaderOpenAPI3;

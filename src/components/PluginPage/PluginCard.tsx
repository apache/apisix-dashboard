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
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';
import { useIntl } from 'umi';

interface Props extends CardProps {
  name: string;
}

const PluginCard: React.FC<Props> = ({ name, actions }) => {
  const { formatMessage } = useIntl();

  return (
    <Card actions={actions}>
      <Card.Meta
        title={name}
        description={formatMessage({
          id: `PluginPage.card.${name}.desc`,
          defaultMessage: formatMessage({ id: 'PluginPage.card.refer.documents' }),
        })}
      />
    </Card>
  );
};

export default PluginCard;

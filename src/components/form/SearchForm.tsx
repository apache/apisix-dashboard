/**
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
import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type SearchFormValues = {
  name?: string;
  id?: string;
  host?: string;
  path?: string;
  description?: string;
  plugin?: string;
  labels?: string[];
  version?: string;
  status?: string;
};

type Option = {
  label: string;
  value: string;
};

type SearchFormProps = {
  onSearch?: (values: SearchFormValues) => void;
  onReset?: (values: SearchFormValues) => void;
  labelOptions?: Option[];
  versionOptions?: Option[];
  statusOptions?: Option[];
  initialValues?: Partial<SearchFormValues>;
};

export const SearchForm = (props: SearchFormProps) => {
  const {
    onSearch,
    onReset,
    labelOptions,
    versionOptions,
    statusOptions,
    initialValues,
  } = props;

  const { t } = useTranslation('common');
  const [form] = Form.useForm<SearchFormValues>();

  const defaultStatusOptions = useMemo<Option[]>(
    () => [
      {
        label: t('form.searchForm.status.all'),
        value: 'UnPublished/Published',
      },
      {
        label: t('form.searchForm.status.published'),
        value: 'Published',
      },
      {
        label: t('form.searchForm.status.unpublished'),
        value: 'UnPublished',
      },
    ],
    [t]
  );

  const mergedStatusOptions = useMemo(
    () => statusOptions ?? defaultStatusOptions,
    [defaultStatusOptions, statusOptions]
  );
  const resolvedInitialValues = useMemo(() => {
    const defaultStatus = mergedStatusOptions[0]?.value ?? undefined;
    return {
      status: defaultStatus,
      ...initialValues,
    } satisfies SearchFormValues;
  }, [initialValues, mergedStatusOptions]);

  useEffect(() => {
    form.setFieldsValue(resolvedInitialValues);
  }, [form, resolvedInitialValues]);

  const handleFinish = (values: SearchFormValues) => {
    onSearch?.(values);
  };

  const handleReset = async () => {
    form.resetFields();
    form.setFieldsValue(resolvedInitialValues);
    const values = form.getFieldsValue();
    onReset?.(values);
    onSearch?.(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      onFinish={handleFinish}
      style={{
        padding: '20px',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e8e8e8',
      }}
    >
      <Row gutter={[16, 0]}>
        {/* First column - spans 2 rows */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item<SearchFormValues>
            name="name"
            label={t('form.searchForm.fields.name')}
            style={{ marginBottom: '16px' }}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item<SearchFormValues>
            name="id"
            label={t('form.searchForm.fields.id')}
            style={{ marginBottom: '16px' }}
          >
            <Input allowClear />
          </Form.Item>
        </Col>

        {/* Second column - first row */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item<SearchFormValues>
            name="host"
            label={t('form.searchForm.fields.host')}
            style={{ marginBottom: '16px' }}
          >
            <Input allowClear />
          </Form.Item>
          {/* Second column - second row */}
          <Form.Item<SearchFormValues>
            name="plugin"
            label={t('form.searchForm.fields.plugin')}
            style={{ marginBottom: '16px' }}
          >
            <Input allowClear />
          </Form.Item>
        </Col>

        {/* Third column - first row */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item<SearchFormValues>
            name="path"
            label={t('form.searchForm.fields.path')}
            style={{ marginBottom: '16px' }}
          >
            <Input allowClear />
          </Form.Item>
          {/* Third column - second row */}
          <Form.Item<SearchFormValues>
            name="labels"
            label={t('form.searchForm.fields.labels')}
            style={{ marginBottom: '16px' }}
          >
            <Select
              mode="multiple"
              placeholder={t('form.searchForm.placeholders.labels')}
              allowClear
              options={labelOptions}
            />
          </Form.Item>
        </Col>

        {/* Fourth column - first row */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item<SearchFormValues>
            name="description"
            label={t('form.searchForm.fields.description')}
            style={{ marginBottom: '16px' }}
          >
            <Input allowClear />
          </Form.Item>
          {/* Fourth column - second row */}
          <Form.Item<SearchFormValues>
            name="version"
            label={t('form.searchForm.fields.version')}
            style={{ marginBottom: '16px' }}
          >
            <Select
              placeholder={t('form.searchForm.placeholders.version')}
              allowClear
              options={versionOptions}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Third row - Status and Actions */}
      <Row gutter={[16, 0]} align="bottom" style={{ marginTop: '8px' }}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item<SearchFormValues>
            name="status"
            label={t('form.searchForm.fields.status')}
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder={t('form.searchForm.placeholders.status')}
              allowClear
              options={mergedStatusOptions}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={18}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              height: '32px',
            }}
          >
            <Space size="middle">
              <Button onClick={handleReset} size="middle">
                {t('form.searchForm.actions.reset')}
              </Button>
              <Button type="primary" htmlType="submit" size="middle">
                {t('form.searchForm.actions.search')}
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchForm;

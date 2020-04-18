import React, {useEffect} from "react";
import {useForm} from "antd/es/form/util";
import {Button, Card, Form, Input, notification} from "antd";
import {formatMessage, FormattedMessage} from "umi-plugin-react/locale";
import {router} from "umi";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import {getAdminAPI, getAdminAPIKey} from "@/utils/utils";

const layout = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 8,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 2,
  },
};

const Settings: React.FC = () => {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue({
      admin_api: getAdminAPI(),
      admin_api_key: getAdminAPIKey()
    })
  });

  const onFinish = (values: any) => {
    localStorage.setItem('admin_api', values.admin_api);
    localStorage.setItem('admin_api_key', values.admin_api_key);

    notification.success({
      message: `${formatMessage({id: 'component.global.update'})} Admin API ${formatMessage({
        id: 'component.status.success',
      }).toLowerCase()}`,
    });
  };

  return (
    <PageHeaderWrapper>
      <Card>
        <Form {...layout} form={form} onFinish={onFinish}>
          <Form.Item
            label="Admin API"
            name="admin_api"
            rules={[
              {required: true, message: formatMessage({id: 'app.settings.fieldAdminAPIInvalid'})},
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="X-API-KEY"
            name="admin_api_key"
          >
            <Input />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button style={{marginRight: 10}} onClick={() => router.goBack()}>
              <FormattedMessage id='component.global.cancel' />
            </Button>

            <Button htmlType="submit" type="primary">
              <FormattedMessage id='component.global.save' />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
};

export default Settings;

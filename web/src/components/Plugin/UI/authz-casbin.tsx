import { useIntl } from "umi";
import Form, { FormInstance } from "antd/es/form";
import React from "react";
import { Input } from "antd";

type Props = {
    form: FormInstance;
    schema: Record<string, any> | undefined;
    ref?: any;
}

const FORM_ITEM_LAYOUT = {
    labelCol: {
        span: 7,
    },
    wrapperCol: {
        span: 8,
    },
};

const AuthzCasbin: React.FC<Props> = ({ form, schema }) => {
    const { formatMessage } = useIntl();
    const properties = schema?.properties
    
    return (
        <Form form={form} {...FORM_ITEM_LAYOUT}>
            <Form.Item
                name="model_path"
                label="model_path"
                rules={[
                    {
                      required: true,
                      message: `${formatMessage({ id: 'component.global.pleaseEnter' })} model_path`,
                    },
                  ]}
                initialValue={properties.model_path.default}
                tooltip={formatMessage({ id: 'component.pauginForm.authz-casbin.model_path.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="policy_path"
                label="policy_path"
                rules={[
                    {
                      required: true,
                      message: `${formatMessage({ id: 'component.global.pleaseEnter' })} policy_path`,
                    },
                  ]}
                initialValue={properties.policy_path.default}
                tooltip={formatMessage({ id: 'compoenet.pauginForm.authz-casbin.policy_path.tooltip'})}
            >
               <Input />
            </Form.Item>
            
            <Form.Item
               name="username"
               label="username"
               rules={[
                {
                  required: true,
                  message: `${formatMessage({ id: 'component.global.pleaseEnter' })} username`,
                },
              ]}
               initialValue={properties.username.defalt}
               tooltip={formatMessage({ id:'compoenet.pauginForm.authz-casbin.username.tooltip'})}
            >
              <Input/>
            </Form.Item>
        </Form >
    )
}



export default AuthzCasbin
import { FormInstance, Input } from "antd";
import React from "react";
import { useIntl } from "umi";
import Form from "antd/es/form";

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
        span: 10,
    },
};

const AuthzKeycloak: React.FC<Props> = ({ form, schema }) => {
    const { formatMessage } = useIntl();
    const properties = schema?.properties

    return (
        <Form form={form} {...FORM_ITEM_LAYOUT}>
            <Form.Item
                name="token_endpoint"
                label="token_endpoint"
                rules={[
                    {
                        required: true,
                        message: `${formatMessage({ id: 'component.global.pleaseEnter' })} token_endpoint`,
                    },
                ]}
                initialValue={properties.token_endpoint.default}
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.token_endpoint.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="grant_type"
                label="grant_type"
                initialValue={"urn:ietf:params:oauth:grant-type:uma-ticket"}
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.grant_type.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="audience"
                label="audience"
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.audience.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="permissions"
                label="permissions"
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.permissions.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="timeout"
                label="timeout"
                initialValue={3000}
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.timeout.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="ssl_verify"
                label="ssl_verify"
                initialValue={"ture"}
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.ssl_verify.tooltip' })}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="policy_enforcement_mode"
                label="policy_enforcement_mode"
                initialValue={"ENFORCING"}
                tooltip={formatMessage({ id: 'component.pauginForm.authz-keycloak.policy_enforcement_mode.tooltip' })}
            >
                <Input />
            </Form.Item>

        </Form >
    )
}

export default AuthzKeycloak 
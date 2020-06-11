import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Empty, Button, Card } from 'antd';
import { history } from 'umi';
import { stringify } from 'qs';

const Metrics: React.FC<{}> = () => {
  const GLOBAL_ADMIN_SETTING_GRAFANA_URL =
    localStorage.getItem('GLOBAL_ADMIN_SETTING_GRAFANA_URL') || undefined;
  const [showMetricsDashboard] = useState(GLOBAL_ADMIN_SETTING_GRAFANA_URL);
  return (
    <PageHeaderWrapper>
      <Card>
        {!showMetricsDashboard && (
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={<span>您还未配置 Grafana</span>}
          >
            <Button
              type="primary"
              onClick={() => {
                history.replace({
                  pathname: '/setting',
                  search: stringify({
                    redirect: window.location.href,
                  }),
                });
              }}
            >
              现在配置
            </Button>
          </Empty>
        )}
        {showMetricsDashboard && (
          <div>
            <iframe
              title="metrics"
              src={GLOBAL_ADMIN_SETTING_GRAFANA_URL}
              width="100%"
              height="860"
              frameBorder="0"
            />
          </div>
        )}
      </Card>
    </PageHeaderWrapper>
  );
};

export default Metrics;

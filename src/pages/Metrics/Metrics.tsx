import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Empty, Button, Card } from 'antd';
import { history } from 'umi';

import { getGrafanaURL } from './service';

const Metrics: React.FC = () => {
  const [grafanaURL, setGrafanaURL] = useState<string | undefined>();

  useEffect(() => {
    getGrafanaURL().then((url) => {
      setGrafanaURL(url);
    });
  }, []);

  return (
    <PageHeaderWrapper title="监控">
      <Card>
        {!grafanaURL && (
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
                  pathname: '/settings',
                });
              }}
            >
              现在配置
            </Button>
          </Empty>
        )}
        {grafanaURL && (
          <div>
            <iframe title="metrics" src={grafanaURL} width="100%" height="860" frameBorder="0" />
          </div>
        )}
      </Card>
    </PageHeaderWrapper>
  );
};

export default Metrics;

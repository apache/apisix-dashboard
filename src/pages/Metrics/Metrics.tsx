import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Empty, Button, Card } from 'antd';
import { history } from 'umi';
import { stringify } from 'qs';
import { getGrafanaConfig } from './service';

const Metrics: React.FC<{}> = () => {
  const [grafanaURL, setGrafanaURL] = useState<string>('');
  const [showMetrics, setShowMetrics] = useState(Boolean(grafanaURL));

  useEffect(() => {
    const url = getGrafanaConfig();
    setGrafanaURL(url);
    setShowMetrics(Boolean(url));
  }, []);

  return (
    <PageHeaderWrapper>
      <Card>
        {!showMetrics && (
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
        {showMetrics && (
          <div>
            <iframe title="metrics" src={grafanaURL} width="100%" height="860" frameBorder="0" />
          </div>
        )}
      </Card>
    </PageHeaderWrapper>
  );
};

export default Metrics;

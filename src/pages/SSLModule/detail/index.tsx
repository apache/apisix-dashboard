import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useParams } from 'dva';
import { getPageMode } from '@/utils/utils';

const Detail: React.FC = () => {
  const [mode] = useState<PageMode>(getPageMode());
  const { key } = useParams();

  return (
    <PageHeaderWrapper>
      {mode}
      {key}
    </PageHeaderWrapper>
  );
};

export default Detail;

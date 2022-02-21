import { useEffect, useState } from 'react';
import { useLocation } from 'umi';
import { history } from 'umi';
import querystring from 'query-string';

export default function usePagination() {
  const location = useLocation();
  const [paginationConfig, setPaginationConfig] = useState({ pageSize: 10, current: 1 });
  useEffect(() => {
    const { page = 1, pageSize = 10 } = querystring.parse(location.search);
    setPaginationConfig({ pageSize: Number(pageSize), current: Number(page) });
  }, [location.search]);

  const savePageList = (page = 1, pageSize = 10) => {
    history.replace(`${location.pathname}?page=${page}&pageSize=${pageSize}`);
  };

  return { paginationConfig, savePageList };
}

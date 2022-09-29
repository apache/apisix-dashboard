import { useCallback, useState } from 'react';

export default function useRequest<T, Y extends any[]>(requestFn: any) {
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<T>();

  const [err, setErr] = useState();

  const fn = useCallback(async (...params: Y) => {
    setLoading(true);
    let res;
    try {
      res = await requestFn(...params);
      setData(res);
    } catch (error) {
      // @ts-ignore
      setErr(error);
    }
    setLoading(false);
    return res;
  }, []);

  return {
    fn,
    data,
    err,
    loading,
  };
}

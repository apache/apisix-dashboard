import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/users');
}

export async function queryCurrent(): Promise<any> {
  // NOTE: APISIX doesn‘t support user login currently, we return fake data directly.
  return {
    name: 'APISIX User',
    avatar: 'favicon.png',
    userid: '00000001',
  };
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

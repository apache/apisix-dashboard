import { API_GLOBAL_RULES } from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';

export const putGlobalRuleReq = (data: A6Type['GlobalRulePut']) =>
  req.put<A6Type['GlobalRulePut'], A6Type['RespGlobalRuleDetail']>(
    API_GLOBAL_RULES,
    data
  );

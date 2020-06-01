declare namespace RouteModule {
  interface MatchingRule {
    paramsLocation: 'query' | 'params' | 'header' | 'cookie';
    paramsName: string;
    paramsExpresstion: '==' | '～=' | '>' | '<' | '~~';
    paramsValue: string;
    key: string;
  }

  type Step1Data = {
    name: string;
    protocol: [];
    hosts: string[];
    paths: string[];
    httpMethods: [];
    advancedMatchingRules: MatchingRule[];
  };

  type Step3Data = {
    plugins: {
      [name: string]: any;
    };
  };

  interface Data {
    data: {
      step1Data: Step1Data;
      step3Data: Step3Data;
    };
    onChange(data: T): void;
  }

  type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

  type RequestProtocol = 'HTTPS' | 'HTTP';
}

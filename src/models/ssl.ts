export interface SSL {
  sni: string[];
  cert: string;
  key: string;
}

export interface ModelState {}

export interface ModelType {
  namespace: string;
  state: ModelState;
  effects: {};
  reducers: {};
}

const model: ModelType = {
  namespace: 'ssl',
  state: {},
  effects: {},
  reducers: {},
};

export default model;

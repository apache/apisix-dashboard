declare namespace ConsumerModule {
  type Entity = {
    username: string;
    desc: string;
    plugins: {
      // TODO: 完善类型
      [name: string]: any;
    };
  };

  type ResEntity = Entity & {
    id: string;
    update_time: string;
  };
}

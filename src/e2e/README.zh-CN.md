### 本地书写测试案例

1. 安装依赖并运行本地开发环境

   ```Bash
   yarn install && yarn start
   ```

2. 在 `src/e2e` 文件夹增加新的测试案例文件
3. 运行测试案例

   ```Bash
   yarn test
   ```

   如果你想单独运行某一个测试文件，可以执行如下命令

   ```Bash
   yarn test ${yourFileName}.e2e.js
   ```

   测试结果将会在控制台显示。

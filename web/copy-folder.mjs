// eslint-disable-next-line import/no-extraneous-dependencies
import { copyDir } from 'hexo-fs';

(async () => {
  if (process.argv.length < 4) {
    console.error('Usage: node --experimental-modules copy-folder.mjs ...srcDirs tarDir');
    process.exit(1);
  }

  const [, , ...srcDirs] = process.argv;
  const tarDir = srcDirs.pop();

  await Promise.allSettled(
    srcDirs.map((srcDir) => copyDir(`./node_modules/${srcDir}`, `${tarDir}/${srcDir}`)),
  );
})();

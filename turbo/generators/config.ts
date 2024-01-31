import type {PlopTypes} from '@turbo/gen';

import * as fs from 'node:fs';
import * as path from 'node:path';

const nonAdapterPackageNames = ['core', 'typeschema'];

function getPackageNames(plop: PlopTypes.NodePlopAPI): Array<string> {
  const packagesPath = path.join(plop.getDestBasePath(), 'packages');
  const packagesDir = fs.readdirSync(packagesPath, {withFileTypes: true});
  return packagesDir.filter(file => file.isDirectory()).map(file => file.name);
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  const packageNames = getPackageNames(plop);
  const adapterNames = packageNames.filter(
    packageName => !nonAdapterPackageNames.includes(packageName),
  );

  plop.setGenerator('adapters', {
    actions: adapterNames.flatMap(adapterName => [
      {
        force: true,
        path: 'packages/' + adapterName + '/src/index.ts',
        templateFile: 'templates/index.ts.hbs',
        type: 'add',
      },
    ]),
    description: 'Generates common adapter files',
    prompts: [],
  });
}

import fs from 'fs';
import prettier from 'prettier';
import { generateTypes } from './index';

const jsonFile = JSON.parse(fs.readFileSync(process.argv[2]));

const types = generateTypes(jsonFile);

console.log(
  prettier.format(
    Object.keys(types)
      .map(type => `export type ${type} = ${types[type]};`)
      .join('\n'),
    { parser: 'flow' }
  )
);

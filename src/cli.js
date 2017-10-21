import fs from 'fs';
import yargs from 'yargs';
import { generateTypes, formatTypes } from './index';

const args = yargs
  .command(['generate [files..]', '*'], 'generate types from json schemas')
  .option('write', {
    describe: 'write types to file',
    type: 'boolean',
    default: false,
    alias: 'w'
  })
  .option('pretty', {
    describe: 'pretty-print types',
    type: 'boolean',
    default: true,
    alias: 'p'
  })
  .help().argv;

args.files.forEach(file => {
  const jsonSchema = JSON.parse(fs.readFileSync(file));
  const types = generateTypes(jsonSchema);
  const formatted = formatTypes(types, args.pretty);

  if(args.write) {
    fs.writeFileSync(file+'.flow.js', formatted);
    console.log('✔️ '+file);
  } else {
    console.log(formatted);
  }
});

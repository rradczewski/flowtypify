import fs from 'fs';
import path from 'path';
import { generateTypes } from '../src';

const fixtures = fs
  .readdirSync(path.join(__dirname, 'scenarios'))
  .filter(name => name.endsWith('.json'))
  .map(jsonFile => ({
    name: jsonFile,
    jsonSchema: require(path.join(__dirname, 'scenarios/', jsonFile)),
    expectedOutput: require(path.join(
      __dirname,
      'scenarios/',
      path.basename(jsonFile, '.json') + '.js'
    )).default
  }));

describe('Scenarios from test/scenarios', () =>
  fixtures.forEach(fixture =>
    it(`correctly parses ${fixture.name}`, () => {
      expect(generateTypes(fixture.jsonSchema)).toEqual(fixture.expectedOutput);
    })
  ));

[![npm version](https://badge.fury.io/js/flowtypify.svg)](https://badge.fury.io/js/flowtypify)

[![CI](https://travis-ci.org/rradczewski/flowtypify.svg)](https://travis-ci.org/rradczewski/flowtypify)
[![Deps](https://david-dm.org/rradczewski/flowtypify.svg)](https://david-dm.org/rradczewski/flowtypify) [![DevDeps](https://david-dm.org/rradczewski/flowtypify/dev-status.svg)](https://david-dm.org/rradczewski/flowtypify)

# Flowtypify - Generate Flowtype Definitions from JSON Schemas

`flowtypify` generates flowtype definitions from a given JSON Schema. This enables you to type-check the contract your app is working against. Whenever you update the schema, regenerate the flowtype definitions and flow will tell you about breaking changes.

Version-wise its an early Proof of Concept, but the [testsuite](test/scenarios/) already covers most of the features I've seen in the wild so far.

## Usage

Invoking `fowtypify` will parse the JSON schemas and output the types to `STDOUT`. With `--write` enabled, a file with the same basename plus `.flow.js` will be created for each supplied schema.

```shell
npm install --save-dev flowtypify
./node_modules/.bin/flowtypify --write src/schematas/*.json
```
![Example Screenshot](example.png)

## FAQ

### Flowtypify generates lots of unsealed types (`& Object`)

Yepp, that's, apart from the lack of any optimizations in `flowtypify`, due to your schema not having `additionalProperties: false` set on object definitions you have.

## What works?

Everything in [test/scenarios](test/scenarios) works, the following does not work, yet ;)

- [ ] Resolve external `$ref` links
- [ ] Resolve definitions through `$id` fields (no support for `$id` as of [JSON Schema Core 9.2](http://json-schema.org/latest/json-schema-core.html#id-keyword) at all, yet)
- [ ] Transformations
  - [ ] Change `RootType` name
  - [ ] Transform Type names (e.g. uppercase)
  - [ ] Custom transformations (e.g. `Optional<*>` types)

## Similar or related libraries

- [`json-schema-to-flow-type`](https://github.com/dannynelson/json-schema-to-flow-type) by @dannynelson
- [`json-schema-to-typescript`](https://github.com/bcherny/json-schema-to-typescript/) by @bcherny

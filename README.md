# Flowtypify - Generate Flowtype Definitions from JSON Schemas

`Flowtypify` is a flexible type generator for JSON Schemas. Think `WSDL` for Flowtype.

## Usage

```shell
npm install -D flowtypify
./node_modules/.bin/flowtypify src/schematas/*.json
```

## Development Status

- [ ] Generate type definitions for *most-simple* schemata
- [ ] Support for enumerations
- [ ] Transformations
  - [ ] Change `RootType` name
  - [ ] Transform Type names (e.g. uppercase)
  - [ ] Custom transformations (e.g. `Optional<*>` types)
- [ ] Resolve schema-internal `$ref` links
- [ ] Resolve external `$ref` links

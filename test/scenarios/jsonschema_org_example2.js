/*
Good example for a schema that could use optimization techniques:
- `RootType.storage` shows how JSON Schema's `additionalProperties` is really ambiguous
- `nfs.server` could be optimized by introducing an AST
*/

export default {
  RootType:
    '({ storage: (Object & (diskDevice | diskUUID | nfs | tmpfs)), fstype?: ("ext3" | "ext4" | "btrfs"), options?: Array<string>, readonly?: boolean } & Object)',
  diskDevice: '{ type: "disk", device: string }',
  diskUUID: '{ type: "disk", label: string }',
  nfs:
    '{ type: "nfs", remotePath: string, server: (string & (string | string | string)) }',
  tmpfs: '{ type: "tmpfs", sizeInMB: number }'
};

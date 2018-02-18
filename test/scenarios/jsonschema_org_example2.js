/*
Good example for a schema that could use optimization techniques:
- `RootType.storage` shows how JSON Schema's `additionalProperties` is really ambiguous
- `nfs.server` could be optimized by introducing an AST
*/

export default {
  RootType:
    '({ storage: (Object & (DiskDevice | DiskUuid | Nfs | Tmpfs)), fstype?: ("ext3" | "ext4" | "btrfs"), options?: Array<string>, readonly?: boolean } & Object)',
  DiskDevice: '{ type: "disk", device: string }',
  DiskUuid: '{ type: "disk", label: string }',
  Nfs:
    '{ type: "nfs", remotePath: string, server: (string & (string | string | string)) }',
  Tmpfs: '{ type: "tmpfs", sizeInMB: number }'
};

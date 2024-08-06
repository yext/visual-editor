# Types

## TemplateMetadata

A useful type for receiving template metadata from the Yext platform via
[useReceiveMessage](./../hooks/README.md#usereceivemessage). This is the type of the Editor
[prop](./../components/README.md#editor) templateMetadata.

### Type definition

| Name       | Type    | Optional |
| ---------- | ------- | -------- |
| role       | string  | no       |
| siteId     | number  | no       |
| templateId | string  | no       |
| layoutId   | number  | yes      |
| entityId   | number  | yes      |
| isDevMode  | boolean | no       |

Note: one of entityId or layoutId must be set.

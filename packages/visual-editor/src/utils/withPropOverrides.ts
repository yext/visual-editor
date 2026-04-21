import { YextComponentConfig } from "../fields/fields.ts";

export function withPropOverrides<C extends YextComponentConfig>(
  base: C,
  overrides: Partial<typeof base.defaultProps>
): C {
  return {
    ...base,
    render: (props) => base.render({ ...props, ...overrides }),
  };
}

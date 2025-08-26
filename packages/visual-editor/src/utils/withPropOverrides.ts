import { ComponentConfig } from "@measured/puck";

export function withPropOverrides<C extends ComponentConfig>(
  base: C,
  overrides: Partial<typeof base.defaultProps>
): C {
  return {
    ...base,
    render: (props) => base.render({ ...props, ...overrides }),
  };
}

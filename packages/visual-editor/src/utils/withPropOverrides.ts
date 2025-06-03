import { ComponentConfig, DefaultComponentProps } from "@measured/puck";

export function withPropOverrides<P extends DefaultComponentProps>(
  base: ComponentConfig<P>,
  overrides: Partial<P>
): ComponentConfig<P> {
  return {
    ...base,
    render: (props) => base.render({ ...props, ...overrides }),
  };
}

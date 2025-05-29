import { ComponentConfig, DefaultComponentProps } from "@measured/puck";
import { NearbyLocationsSectionProps } from "../components/pageSections/NearbyLocations.tsx";

// ComponentPropOverrides contains a mapping of overridable props for a component
type ComponentPropOverrides = {
  NearbyLocationsSection: Pick<
    NearbyLocationsSectionProps,
    "contentEndpointEnvVar"
  >;
};

export function withPropOverrides<
  P extends DefaultComponentProps,
  K extends keyof ComponentPropOverrides,
>(
  base: ComponentConfig<P> & (K extends any ? { label: K } : never),
  overrides: ComponentPropOverrides[K]
): ComponentConfig<P> {
  return {
    ...base,
    render: (props) => base.render({ ...props, ...overrides }),
  };
}

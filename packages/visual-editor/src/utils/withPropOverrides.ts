import { ComponentConfig } from "@measured/puck";
import { NearbyLocationsSectionProps } from "../components/pageSections/NearbyLocations.tsx";

// ComponentPropOverrides contains a mapping of overridable props for a component
type ComponentPropOverrides = {
  NearbyLocationsSection: Pick<
    NearbyLocationsSectionProps,
    "contentEndpointEnvVar"
  >;
};

export function withPropOverrides<
  K extends keyof ComponentPropOverrides,
  P extends object = ComponentPropOverrides[K] & object,
>(
  base: ComponentConfig<P>,
  overrides: ComponentPropOverrides[K]
): ComponentConfig<P> {
  return {
    ...base,
    render: (props) => base.render({ ...props, ...overrides }),
  };
}

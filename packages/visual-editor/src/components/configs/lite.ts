import { Config } from "@measured/puck";
import { mainConfig } from "./mainConfig";
import { directoryConfig } from "./directoryConfig";

function makeLiteConfig(config: Config<any>): Config<any> {
  const liteComponents = {};

  Object.keys(config.components).forEach((key) => {
    const component = config.components[key];
    //@ts-ignore
    liteComponents[key] = {
      ...component,
      // Replace the heavy React component with a tiny dummy function
      render: () => null,
    };
  });

  return {
    ...config,
    components: liteComponents,
  };
}

export const liteMainConfig = makeLiteConfig(mainConfig);
export const liteDirectoryConfig = makeLiteConfig(directoryConfig);

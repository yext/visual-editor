---
title: Getting Started
outline: deep
---

# Creating Visual Editor-Compatible Components

## Simple React Component

Create a React component as you normally would in [https://github.com/yext/visual-editor/tree/main/packages/visual-editor/src/components/puck](https://github.com/yext/visual-editor/tree/main/packages/visual-editor/src/components/puck).

1. Use upper camel case for the component filename.
2. Name the React component with “Component” as the suffix, ie “FooComponent”
3. The React component should not be exported.
4. Create and export the the component props as a type with “Props” as the suffix, ie “FooProps”
5. Use Tailwind for styling.
6. If you need access to the document use the hook `useDocument()`. If you need access to `relativePrefixFromRoot` use the hook `useTemplateProps()`.

## Converting to a Puck Component

A Puck component is nothing more than a React component with additional configuration. The Puck [documentation](https://puckeditor.com/docs/api-reference/configuration/component-config) explains this well, but there are four main ComponentConfig parameters you will configure:

1. **render** \- a function that returns your React component. This is the bare minimum necessary in order to have the component show up in the Puck left sidebar so the component can be dragged into the edit zone (middle section).
2. **fields** \- an object that defines the list of props available for the component. These are the user-settable options that show on the Puck right sidebar.
3. **defaultProps** \- the default values/configuration of the above fields.
4. **resolveFields** \- a function to dynamically change/set fields based on the value of another field. Right now we’ve mostly only been using this for font-related things.

Use [Banner](https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/puck/Banner.tsx) as an example to get you started.

Make sure to export your Puck component with the name you actually want the component to be. Following the example, you would export “Foo”.

## Defining Puck Fields

Fields are a configuration of your component’s props to get them to display on the right side panel. Puck has a handful of [built-in fields](https://puckeditor.com/docs/api-reference/fields) you can use, defined by the `type` property. This will automatically render out the field. Each component prop should have a corresponding field.  
We have a custom prop type called `YextEntityField` and a corresponding custom field called `YextEntityFieldSelector`.

| export type YextEntityField\<T\> \= { field: string; constantValue: T; constantValueEnabled?: boolean;}; |
| :------------------------------------------------------------------------------------------------------- |

YextEntityField allows a user to set either a KG field (one from the document) or use a constant value instead. YextEntityFieldSelector properly renders these selection options for you. It also has some configuration options to filter to specific fields.

## Registering the Component

Now that the Puck component is created we need to make it available for users.

1. Update [index.ts](https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/puck/index.ts) to include your new component.
2. Add your component to the component [registry](https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/puck/registry/components.ts). This makes your component available to locally download via shadcn. See the [readme](https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/puck/registry/README.md) for more information.
3. Once a new version of visual-editor is released, you want to import the component to the starter’s main [ve.config.tsx](https://github.com/YextSolutions/pages-visual-editor-starter/blob/main/src/ve.config.tsx#L77). **NOTE** \- this step will change in the future as we push more configuration down to visual-editor instead of files living in each starter repo. There will be another way to register the components with the templates in the future, at which point this step will be updated. For all intents and purposes this step can be skipped for now and Sumo will handle registering the component with the template.

## Developing and Testing

The easiest way to develop your component is to add your component to the local starter in the visual-editor library.

### Prerequisites

1. Node 20
2. pnpm
3. [Yext CLI](https://hitchhikers.yext.com/guides/cli-getting-started-resources/01-install-cli/)

### Clone and Install visual-editor

1. `git clone https://github.com/yext/visual-editor.git`
2. `cd visual-editor`
3. `pnpm i`
4. `cd starter`
5. `pnpm run dev`

Create your component in `starter/src/components/Foo.tsx` and register it in ve.config.tsx. This will allow you to see changes to your component as you work on it because you’ll get HMR (hot module reloading). Once you’ve finalized your component you can move it over to `packages/visual-editor`. Make sure to import it in /starter from the new location once it’s been moved to double check that everything is working properly.

---
title: Getting Started
outline: deep
---

# Creating Visual Editor-Compatible Components

## Simple React Component

Start by creating a React component as you normally would.

1. Use upper camel case for the component filename.
2. Name the React component with “Component” as the suffix, ie “FooComponent”
3. The React component should not be exported.
4. Create and export the the component props as a type with “Props” as the suffix, ie “FooProps”
5. [optional] Use Tailwind for styling.
6. If you need access to the document use the hook `useDocument()`. If you need access to `relativePrefixFromRoot` use the hook `useTemplateProps()`.

## Converting to a Puck Component

A Puck component is nothing more than a React component with additional configuration. The Puck [documentation](https://puckeditor.com/docs/api-reference/configuration/component-config) explains this well, but there are five main ComponentConfig parameters you will configure:

1. **render** \- a function that returns your React component. This is the bare minimum necessary in order to have the component show up in the Puck left sidebar so the component can be dragged into the edit zone (middle section).
2. **fields** \- an object that defines the list of props available for the component. These are the user-settable options that show on the Puck right sidebar.
3. **defaultProps** \- the default values/configuration of the above fields.
4. **resolveFields** \- a function to dynamically change/set fields based on the value of another field.
5. **resolveData** \- a function to dynamically change/set props based on the value of other props.

Make sure to export your Puck component with the name you actually want the component to be. Following the example, you would export “Foo”.

## Defining Puck Fields

Fields are a configuration of your component’s props to get them to display on the right side panel. Puck has a handful of [built-in fields](https://puckeditor.com/docs/api-reference/fields) you can use, defined by the `type` property. This will automatically render out the field. Each component prop should have a corresponding field.

YextEntityField allows a user to set either a KG field (one from the document) or use a constant value instead. YextEntityFieldSelector properly renders these selection options for you. It also has some configuration options to filter to specific fields.

If your component needs to render a repeated list from a linked field, prefer
`createItemSource(...)` instead of wiring multiple `YextEntityField` props by
hand. It generates one repeated `entityField` plus the matching default value
and `resolveItems(...)` helper, so components can store a single prop like
`articles: typeof articleSource.value`. See the
[Linked Entity Item Sources](../editor/README.md#linked-entity-item-sources)
example.

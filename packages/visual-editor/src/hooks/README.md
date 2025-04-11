---
title: Hooks
outline: deep
---

# Hooks

## useTemplateProps

A React hook that returns the templateProps stored in Context. Must be used within the VisualEditorProvider.

ex.

```tsx
export const MyComponent = () => {
  const { document, relativePrefixToRoot } = useTemplateProps();
};
```

## useDocument

A React hook that returns a Content stream document stored in Context. Must be used within the VisualEditorProvider

ex.

```tsx
export const MyComponent = () => {
  const {
    hours,
    address,
    name: locationName,
    c_hero: hero,
  } = useDocument<LocationStream>();
};
```

## usePlatformBridgeDocument

Use this hook to capture the entityDocument from the Yext platform in your `edit.tsx` file.
This is a requirement to make your repo VE compatible and should only be used once - in `edit.tsx`.

Meant to be used in conjunction with the [VisualEditorProvider](../utils/README.md#visualeditorprovider). This provides the data for [useDocument()](#usedocument) to capture while viewing templates from the Visual Editor in platform.

### Usage

```tsx
import {
  Editor,
  usePlatformBridgeDocument,
  VisualEditorProvider,
} from "@yext/visual-editor";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <VisualEditorProvider
      templateProps={{
        document: entityDocument,
      }}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
    >
      <Editor
        document={entityDocument}
        componentRegistry={componentRegistry}
        themeConfig={themeConfig}
      />
    </VisualEditorProvider>
  );
};
```

## usePlatformBridgeEntityFields

Use this hook to capture the entityFields from the Yext platform in your `edit.tsx` file.
This is a requirement to use mappable entity fields in your component props.
Meant to be used in conjunction with the [EntityFieldsProvider](#entityfieldsprovider).

### Usage

```tsx
import {
  Editor,
  usePlatformBridgeDocument,
  usePlatformBridgeEntityFields,
  VisualEditorProvider,
} from "@yext/visual-editor";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <VisualEditorProvider
      templateProps={{
        document: entityDocument,
      }}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
    >
      <Editor
        document={entityDocument}
        componentRegistry={componentRegistry}
        themeConfig={themeConfig}
      />
    </VisualEditorProvider>
  );
};
```

## useEntityFields

A React hook that returns entityFields available to your TemplateConfig's stream. Must be used within an [EntityFieldsProvider](#entityfieldsprovider).

## useBackground and BackgroundProvider

A React hook that returns the active BackgroundStyle for a given component. It is scoped, so `useBackground` will return the most specific
background to a component if there are multiple in the hierarchy. Background context is automatically set
set by `<Section>`. If a component sets the background color without using `<Section>`, then `BackgroundProvider` must be used.

#### Usage

```tsx

const ChildComponent = () => {
  const background = useBackground()
  console.log(background)
  return <></>
}

const MyComponent = () => {
  return (
    // section automatically applies the background color and sets the context
    <Section background={{bgColor: "bg-white", textColor:"text-black"}}>
      <Section background={{bgColor: "bg-blue", textColor:"text-red"}}>
        <ChildComponent /> // prints '{bgColor: "bg-blue", textColor:"text-red"}'
      </Section>
      <ChildComponent /> // prints '{bgColor: "bg-white", textColor:"text-black"}'

      // If applying a background color via a div or other element,
      // you should set the background context manually
      <BackgroundProvider value={{bgColor: "bg-green", textColor:"text-purple"}}>
        <div style={{backgroundColor: "green", color: "purple"}}>
          <ChildComponent /> // prints '{bgColor: "bg-green", textColor:"text-purple"}'
        </div>
      </BackgroundProvider>

      <div style={{backgroundColor: "orange", color: "gray"}}>
          // the context was not set for this div, so useBackground will return the parent's value
          <ChildComponent /> // prints '{bgColor: "bg-white", textColor:"text-black"}'
      </div>
    </Section>
  )
}
```

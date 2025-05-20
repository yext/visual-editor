# Hybrid Site Development Guide

## Set Up

1. Create a new repository using https://github.com/YextSolutions/pages-visual-editor-starter
2. In the Yext Platform, navigate to Pages > All Sites in the sidebar and create a new site
   via the "Add New Site" button. Use the repo you created in step 1.
3. In Knowledge Graph, create a Site entity.
   It is standard to use your business name as the site entity's "name" field.
4. Configure your [site stream](https://hitchhikers.yext.com/docs/pages/site-configuration/?target=site-stream)
   by updating your `config.yaml` to use the site entity's id in place of `entity-id`.
   Also add any alternate profiles you wish to use with your site entity.
5. Set up content endpoints?

## Types of Page Groups

### In-Platform VLE Page Groups

In-Platform Page Groups can be created on the Page Groups page in the Yext platform.
They use a pre-set stream with all entity fields that are not linked-entity fields included.
Currently, all In-Platform Page Groups use the `main` template. There can be multiple
page groups that use the same template.

### In-Repo VLE Page Groups

In-Repo Page Groups are based on a [template](https://hitchhikers.yext.com/docs/pages/templates/)
with a defined `TemplateConfig`, which allows custom stream configuration.
There can only be one In-Repo Page Group per template and the Page Group configuration
cannot be modified on the Page Groups page.

### In-Repo Non-VLE Page Groups

You can also define static and entity pages in your repo that do not support visual editing.
If you add templates without following any steps below, these pages will behave like
[normal PagesJS Pages](https://hitchhikers.yext.com/docs/pages/templates/).
They will not appear on the Page Groups page.

## Adding an In-Repo VLE Page Group

Create a new template following the standard PagesJS format.
Include an exported [`TemplateConfig`](https://hitchhikers.yext.com/docs/pages/templates/?target=stream-configuration-properties),
exported [`getPath`](https://hitchhikers.yext.com/docs/pages/templates/?target=getpath-getpath-templateprops),
exported [`GetHeadConfig`](https://hitchhikers.yext.com/docs/pages/templates/?target=getheadconfig-getheadconfig-templaterenderprops),
and default exported [`Template`](https://hitchhikers.yext.com/docs/pages/templates/?target=maintemplate-template-templaterenderprops) function.
Make the following modifications:

#### TemplateConfig

At the top level of the `TemplateConfig` include:

```ts
additionalProperties: {
  isVETemplate: true;
}
```

It is required to include an entity type filter, even if also using a saved filter.

#### GetHeadConfig

In the `other` section, include the following if you want default VLE behavior

```
other: [
  applyAnalytics(document), // applies the Google Tag Manager script from Site Configuration
  applyHeaderScript(document), // applies the Header script from Site Configuration
  applyTheme(document, themeConfig), // applies the theme styles (include default component styling)
  SchemaWrapper(document._schema), // applies the JSON-LD schema to the page
].join("\n"),
```

#### Template

This is a standard VLE render function:

```tsx
const Location: Template<TemplateRenderProps> = (props) => {
  const { document } = props;

  return (
    <AnalyticsProvider
      apiKey={document?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY}
      templateData={props}
      currency="USD"
    >
      <VisualEditorProvider templateProps={props}>
        <Render
          config={mainConfig}
          data={migrate(
            JSON.parse(document.__.layout),
            migrationRegistry,
            mainConfig,
          )}
        />
      </VisualEditorProvider>
    </AnalyticsProvider>
  );
};
```

`<Render>` converts the saved layout data from the editor into the rendered page.
`migrate` handles updates to built in `visual-editor` components.

### Puck Configs

Each template is associated with a Puck [`Config`](https://puckeditor.com/docs/api-reference/configuration/config),
which defines the components available to that template. To associate a config with a template:

1. Use it in the template's Render component `<Render config={} ...`
2. Register it in the `componentRegistry` of `ve.config.tsx` so it can be used in the editor

```ts
export const componentRegistry = new Map<string, Config<any>>([
  ["main", mainConfig],
  ["directory", directoryConfig],
  // templateName must match the file name of the template (excluding the file extension)
  // configs can be shared between templates
  ["templateName", mainConfig],
]);
```

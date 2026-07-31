import { describe, expect, it } from "vitest";
import { PhotoGalleryWrapper } from "../../pageSections/PhotoGallerySection/PhotoGalleryWrapper.tsx";
import { ImageWrapperFields } from "./Image.tsx";

type ObjectField = {
  objectFields: Record<string, unknown>;
};

describe("image styling fields", () => {
  it("exposes independent image fill and constrain controls", () => {
    const fields = ImageWrapperFields.styles as ObjectField;

    expect(fields.objectFields).toHaveProperty("imageFillType");
    expect(fields.objectFields).toHaveProperty("imageConstrain");
  });

  it("does not duplicate Photo Gallery's imageFillType control", () => {
    const styles = PhotoGalleryWrapper.fields?.styles as ObjectField;
    const nestedImage = styles.objectFields.image as ObjectField;

    expect(styles.objectFields).toHaveProperty("imageFillType");
    expect(nestedImage.objectFields).not.toHaveProperty("imageFillType");
  });
});

import { setDeep } from "@puckeditor/core";

/**
 * Synchronizes specific style properties from the parent component to the child component's data.
 * To be used in resolveData:(data, params) of child components.
 *
 * @param params - The parameters object containing the parent component's props.
 * @param updatedData - The current data of the child component.
 * @param keys - An array of style property keys to synchronize from the parent to the child.
 * @returns The updated child component data with synchronized styles if changes were detected; otherwise, returns the original data.
 */
export const syncParentStyles = (
  params: any,
  updatedData: any,
  keys: string[]
) => {
  const parentStyles = params.parent?.props.styles || {};
  const currentStyles = updatedData.props.parentStyles || {};

  // Check if any value in the list has changed
  const hasChanged = keys.some(
    (key) => parentStyles[key] !== currentStyles[key]
  );

  if (hasChanged) {
    // Construct the new object using only the keys we care about
    const nextStyles = keys.reduce(
      (acc, key) => {
        acc[key] = parentStyles[key];
        return acc;
      },
      { ...currentStyles }
    );

    return setDeep(updatedData, "props.parentStyles", nextStyles);
  }

  return updatedData;
};

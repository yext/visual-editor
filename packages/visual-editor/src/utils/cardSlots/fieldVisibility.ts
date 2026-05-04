/**
 * Returns whether a field with an explicit `Show ...` toggle should render.
 * The field is visible in the editor while editing, or on the live page only
 * when both the toggle is enabled and resolved data is present.
 */
export const shouldRenderToggledField = ({
  isEditing,
  isEnabled,
  hasData,
}: {
  isEditing: boolean;
  isEnabled?: boolean;
  hasData: boolean;
}): boolean => {
  return isEditing || (!!isEnabled && hasData);
};

/**
 * Returns whether a field without a `Show ...` toggle should render.
 * The field is visible in the editor while editing, or on the live page only
 * when resolved data is present.
 */
export const shouldRenderFieldWhenPresent = ({
  isEditing,
  hasData,
}: {
  isEditing: boolean;
  hasData: boolean;
}): boolean => {
  return isEditing || hasData;
};

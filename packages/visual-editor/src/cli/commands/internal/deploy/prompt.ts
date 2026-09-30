export const defaultPromptOpts = {
  onCancel: () => {
    throw new Error("Operation cancelled.");
  },
};

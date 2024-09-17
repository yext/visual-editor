export const resolveProp = <T>(entityField: string, document: any): T => {
  // check for the entity field in the document
  const steps: string[] = entityField.split(".");
  let missedStep = false;
  let current = document;
  for (let i = 0; i < steps.length; i++) {
    if (current?.[steps[i]] !== undefined) {
      current = current[steps[i]];
    } else {
      missedStep = true;
      break;
    }
  }
  if (!missedStep) {
    return current;
  }

  // return as constant value
  return entityField as T;
};

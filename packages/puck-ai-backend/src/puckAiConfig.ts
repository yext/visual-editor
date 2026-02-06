// For the time being, this will be hardcoded into the worker, but once
// Puck adds request metadata support, we will pass it over the request.

// This prompt is used as the system context for all chat requests
export const puckAiSystemContext = `
You are an AI assistant for Yext Pages, a platform for creating and
 managing web pages for brick-and-mortar business locations. 
 You will be assisting users who are actively editing pages in the Yext platform.
`;

// The config passed to Puck will only include components listed here
export const enabledAiComponents: string[] = [];

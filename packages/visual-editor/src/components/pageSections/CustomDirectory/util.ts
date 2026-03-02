interface fetchDataProps {
  endpoint: string;
  apiKey: string;
  entityIds?: string;
}

export const fetchData = async ({
  endpoint,
  apiKey,
  entityIds,
}: fetchDataProps) => {
  try {
    const url = new URL(endpoint);

    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("v", "20250101");

    if (entityIds?.length) {
      url.searchParams.set(
        "entityIds",
        Array.isArray(entityIds) ? entityIds.join(",") : entityIds
      );
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error("Failed to fetch entities:", res.status);
      return;
    }

    const json = await res.json();
    const fetchedEntities = json.response ?? [];

    return fetchedEntities;
  } catch (error) {
    console.error("Entity fetch error:", error);
  }
};

const V_PARAM = "20250707";
const REVIEWS_ENDPOINT_ID = "visualEditorReviews";

/**
 * Fetch reviews for the given entity.
 * @returns A JSON of the reviews data fetched from the endpoint.
 */
type FetchReviewsParams = {
  businessId: number;
  apiKey: string;
  contentDeliveryAPIDomain: string;
  entityId: number;
  limit: number;
  pageToken?: string;
};

export const fetchReviewsForEntity = async ({
  businessId,
  apiKey,
  contentDeliveryAPIDomain,
  entityId,
  limit,
  pageToken,
}: FetchReviewsParams) => {
  // const url = new URL(`${contentDeliveryAPIDomain}/v2/accounts/${businessId}/content/${REVIEWS_ENDPOINT_ID}`);
  const TEMP_ENDPOINT =
    "https://streams.yext.com/v2/accounts/me/api/deepakReviews"; // TODO: remove
  const url = new URL(TEMP_ENDPOINT);
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("v", V_PARAM);
  url.searchParams.append("entity.uid", String(entityId));
  url.searchParams.append("limit", String(limit));
  url.searchParams.append("$sortBy__desc", "reviewDate");
  if (pageToken) {
    url.searchParams.append("pageToken", pageToken);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (data?.meta?.errors && data.meta.errors.length > 0) {
    throw new Error("API returned errors: " + JSON.stringify(data.meta.errors));
  }
  return data;
};

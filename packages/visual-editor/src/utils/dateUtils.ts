/**
 * getCurrentDateYYYYMMDD
 * @return the date in yyyymmdd format, ex: 20250303
 */
export function getCurrentDateYYYYMMDD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

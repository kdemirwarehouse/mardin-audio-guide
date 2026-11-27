// Cache tags for the places data layer. T12 (publish/unpublish) will call `updateTag(PLACES_TAG)` and
// `updateTag(placeTag(slug))` so changes show up immediately instead of after the `cacheLife` window.

export const PLACES_TAG = "places";

export function placeTag(slug: string): string {
  return `place:${slug}`;
}

// Keyless Google Maps directions link (ADR-011): opens the Maps app/site with the place as destination.
// Docs: https://developers.google.com/maps/documentation/urls/get-started#directions-action
export function getDirectionsUrl(latitude: number, longitude: number): string {
  const destination = `${latitude},${longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

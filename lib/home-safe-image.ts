// A few real farm photos in the catalog/category data feature identifiable people
// (farm staff). The Home page should stay people-free per brand guidance, so this
// swaps those specific paths for a designed placeholder — everywhere else (product
// pages, the dedicated Categories/Our Farming pages) still shows the real photos.
const HOME_PAGE_EXCLUDED_PHOTOS = new Set([
  "/farm/pisciculture-pond.jpg",
  "/farm/pisciculture-farmer-portrait.jpg",
  "/farm/pisciculture-fish-farmers-day.jpg",
]);

export function getHomeSafeImage(url: string, fallback = "/placeholders/fish.svg") {
  return HOME_PAGE_EXCLUDED_PHOTOS.has(url) ? fallback : url;
}

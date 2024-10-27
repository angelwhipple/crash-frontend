const ADDRESS_COMPONENTS = {
  street_number: "street_number",
  route: "street",
  locality: "city",
  administrative_area_level_1: "state",
  country: "country",
  postal_code: "postal_code",
}

export const buildQuery = (place: google.maps.places.PlaceResult): Record<string, any> => {
  const { lat, lng } = place.geometry!.location!;
  const query: Record<string, any> = { name: place.name, lat: lat(), lng: lng() }

  Object.entries(ADDRESS_COMPONENTS).forEach(([key, queryKey]) => {
    let elem = place.address_components!.find((component) => component.types.includes(key))
    if (elem) {
      query[queryKey] = elem.short_name;
    }
  });

  return query;
}

export const inRange = (to: google.maps.LatLng, from: google.maps.LatLng, meterRadius: number) => {
  let distance = google.maps.geometry.spherical.computeDistanceBetween(from, to);
  return distance <= meterRadius;
}

export const computeRadiusFromBounds = (map: google.maps.Map, defaultRadius = 8046.7) => {
  const bounds = map.getBounds();
  if (!bounds) return defaultRadius;

  const center = map.getCenter();
  const northEast = bounds.getNorthEast();

  return google.maps.geometry.spherical.computeDistanceBetween(center!, northEast);
}
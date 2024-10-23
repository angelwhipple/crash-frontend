<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader"
import { ref, onBeforeMount, watch } from "vue";

const map = ref();
const place = ref();

const GMAPS_API_KEY = "AIzaSyCyQM2-ltnUqtuuCtzT0phhmBsNaWPkM-k";

const ADDRESS_COMPONENTS = {
  street_number: "street_number",
  route: "street",
  locality: "city",
  administrative_area_level_1: "state",
  country: "country",
  postal_code: "postal_code",
}

const MIT = { lat: 42.360091, lng: -71.0967349 }

const loader = new Loader({
  apiKey: GMAPS_API_KEY,
  version: "weekly",
  libraries: ["maps", "places", "marker", "geometry"],
});

function buildQuery() {
  const { lat, lng } = place.value.geometry.location;
  const query: Record<string, any> = { lat: lat(), lng: lng() }
  Object.entries(ADDRESS_COMPONENTS).forEach(([key, queryKey]) => {
    //@ts-ignore
    let elem = place.value.address_components.find((component) => component.types.includes(key))
    if (elem) {
      query[queryKey] = elem.short_name;
    }
  });
  return query;
}

onBeforeMount(async () => {
  const mapOptions = {
    center: MIT,
    zoom: 16, // dynamically setZoom based on radius slider?
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: "cooperative"
    // minZoom, maxZoom for setting radius bounds?
  }
  loader
    .load()
    .then((google) => {
      map.value = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions)
      const auto = new google.maps.places.Autocomplete(document.getElementById("location-input") as HTMLInputElement);
      auto.addListener('place_changed', () => {
        place.value = auto.getPlace();
        map.value.setCenter(place.value.geometry.location);

        // TODO: query groups by matching { street, city, state, country, postal_code }
        let query = buildQuery();
        console.log(query)


        // TODO: use { lat, lng } to filter groups by Location within 5-25 mi radius
        let distance = google.maps.geometry.spherical.computeDistanceBetween(MIT, { lat: query.lat, lng: query.lng });
        console.log(`Distance from MIT: ${distance} meters`);

        // TODO: set markers & info windows
        const marker = new google.maps.Marker({
          map: map.value,
          position: place.value.geometry.location,
        });
      });
    })
    .catch((e) => {
      console.error(`Failed to load Google Maps API: ${e}`);
    });
});
</script>

<template>
<section id="map">
</section>
</template>

<style scoped>
#map {
  height: 100%;
}
</style>
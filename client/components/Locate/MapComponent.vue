<script setup lang="ts">
import { ref, onBeforeMount, onUnmounted, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { useLocationStore } from "@/stores/locate";

const props = defineProps(["gmapsLoader"]);
const locationStore = useLocationStore();
const { currentLocation, MIT } = storeToRefs(locationStore);

const loader = ref(props.gmapsLoader);

const mapOptions = {
  center: locationStore.MIT,
  zoom: 16,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: "cooperative",
  minZoom: 10,
  maxZoom: 18
}

onBeforeMount(async () => {
 loader
    .value
    .load()
    //@ts-ignore
    .then((google) => {
      const map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions);
      locationStore.initMap(map);
    })
    .catch((e: any) => {
      console.error(`Failed to load Google Maps API: ${e}`);
    });
});
</script>

<template>
<section id="map"></section>
</template>

<style scoped>
#map {
  height: 100%;
}
</style>
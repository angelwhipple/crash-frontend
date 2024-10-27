import { defineStore, storeToRefs } from "pinia";
import { computed, createVNode, ref, render, watch } from "vue";
import { useGroupStore } from "@/stores/group";

import { buildQuery, computeRadiusFromBounds, inRange } from "@/utils/locator";
import { fetchy } from "@/utils/fetchy";
import GroupComponent from "@/components/Group/GroupComponent.vue";

export const useLocationStore = defineStore(
  "locate",
  () => {
    const groupStore = useGroupStore();
    const filteredGroups = computed(() => groupStore.filteredGroups);

    const GMAPS_API_KEY = "AIzaSyCyQM2-ltnUqtuuCtzT0phhmBsNaWPkM-k";
    const MIT = { lat: 42.360091, lng: -71.0967349 }

    const currentLocation = ref();
    const map = ref<google.maps.Map>();
    const isMapActive = ref(false);
    const placeSearch = ref<google.maps.places.PlaceResult>();
    const placeCreate = ref<google.maps.places.PlaceResult>();
    const meterRadius = ref(); // 1 mi = 1609.34 meters
    const markers = ref<google.maps.Marker[]>([]);

    function setCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          currentLocation.value = { lat: position.coords.latitude, lng: position.coords.longitude };
        }, (err) => {
          console.error(err);
        });
      } else {
        console.error("Geolocation is not supported.");
        currentLocation.value = MIT;
      }
    }

    async function toggleMap(active: boolean) {
      isMapActive.value = active;
    }

    async function initMap(googleMap: google.maps.Map) {
      googleMap.addListener("zoom_changed", () => {
        meterRadius.value = computeRadiusFromBounds(googleMap);
        let center = googleMap.getCenter()!;
        groupStore.setGroupFilter({
          lat: center.lat(),
          lng: center.lng(),
          meterRadius: meterRadius.value
        })
      })
      map.value = googleMap;
      await refreshMarkers();
    }

    function clearMarkers() {
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];
    }

    async function refreshMarkers() {
      markers.value = await Promise.all(
        filteredGroups.value.map(async (group) => {
          let response = await fetchLocation(group.location.toString());
          const marker = new google.maps.Marker({
            map: map.value,
            position: { lat: response.location.lat, lng: response.location.lng },
            optimized: true,
            title: group._id.toString()
          });

          const infoWindowContainer = document.createElement('div');
          const node = createVNode(
            GroupComponent,
            { group: group, groupType: group.category, isInfoWindow: true }
          );
          render(node, infoWindowContainer);
          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContainer,
            ariaLabel: "Uluru",
          });

          marker.addListener("click",  () => {
            infoWindow.open({
              anchor: marker,
              map: map.value
            })
            infoWindow.focus();
          })
          return marker;
        })
      );
    }

    function setAutocomplete(auto: google.maps.places.Autocomplete, type: string): void {
      auto.addListener('place_changed', () => {
        if (type === "create") {
          placeCreate.value = auto.getPlace();
        } else {
          placeSearch.value = auto.getPlace();
        }
      });
    }

    function centerMap(): void {
      if (map.value && placeSearch.value) {
        map.value.setCenter(placeSearch.value.geometry!.location!);
      }
    }

    async function saveLocation(type: string) {
      let query = buildQuery(placeCreate.value!);
      return await fetchy("/api/locations", "POST", { body: query, alert: false });
    }

    async function fetchLocation(id: string) {
      return await fetchy(`/api/locations/${id}`, "GET", { alert: false });
    }

    watch(filteredGroups, async () => {
      clearMarkers();
      await refreshMarkers();
    })

    return {
      GMAPS_API_KEY,
      currentLocation,
      map,
      isMapActive,
      placeSearch,
      placeCreate,
      meterRadius,
      setCurrentLocation,
      initMap,
      toggleMap,
      centerMap,
      setAutocomplete,
      saveLocation,
      fetchLocation
    }
  }
)
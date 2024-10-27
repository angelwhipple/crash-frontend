<script setup lang="ts">
import { ref, defineProps, onBeforeMount, markRaw } from "vue";
import { useLocationStore } from "@/stores/locate";
import { useGroupStore } from "@/stores/group";

const props = defineProps(["gmapsLoader"])
const locationStore = useLocationStore();
const groupStore = useGroupStore();

const loader = ref(props.gmapsLoader);
const searchName = ref("");
const moveInDate = ref();
const moveOutDate = ref();

async function search() {
  if (assertLocationNonempty()) {
    const searchFilter = {
      name: searchName.value,
      meterRadius: locationStore.meterRadius,
      lat: locationStore.placeSearch!.geometry!.location!.lat(),
      lng: locationStore.placeSearch!.geometry!.location!.lng()
    }
    groupStore.setGroupFilter(searchFilter);
    locationStore.centerMap();
  }
}

function assertLocationNonempty() {
  return locationStore.placeSearch?.place_id != undefined;
}

onBeforeMount(() => {
  loader
    .value
    .load()
    //@ts-ignore
    .then((google) => {
      const auto = new google.maps.places.Autocomplete(document.getElementById("search-location-input") as HTMLInputElement);
      locationStore.setAutocomplete(auto, "search");
    })
    .catch((e: any) => {
      console.error(`Failed to load Google Maps API: ${e}`);
    });
})
</script>

<template>
<section class="search-panel">
  <div class="searchbar">
    <label v-if="groupStore.groupView == 'community'">
      Who
      <input v-model.trim="searchName" id="search-name-input" placeholder="Search communities..."/>
    </label>
    <span v-else>
      <label>
        Movein
        <input v-model.trim="moveInDate" id="movein-date-input" type="date"/>
      </label>
      <label>
        Moveout
        <input v-model.trim="moveOutDate" id="moveout-date-input" type="date"/>
      </label>
    </span>
    <label>
      Where
      <input id="search-location-input" placeholder="City, state, or zipcode" type="text" />
    </label>
    <button class="search-button" @click="search">
      <v-icon name="fa-search" scale="1.25" fill="white"></v-icon>
    </button>
  </div>
</section>
</template>

<style scoped>
.search-button {
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  background-color: var(--primary);
  opacity: 0.7;
  transition-duration: 0.3s;
}

.search-button:hover {
  opacity: 1;
}

.search-panel {
  width: 100%;
  height: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.searchbar {
  width: 40%;
  height: fit-content;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 5rem;
  padding: 1rem;
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
}

.searchbar span {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.searchbar label {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.searchbar input {
  width: 70%;
  border-radius: 2rem;
  padding: 1rem;
  border: transparent;
  outline: none;
}

.searchbar input:focus, .searchbar input:hover {
  background-color: var(--light-gray);
  transition-duration: 0.3s;
}
</style>
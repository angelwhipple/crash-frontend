<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from "@/router";
import { onBeforeMount } from "vue";
import CreateGroupForm from "@/components/Group/CreateGroupForm.vue";
import GroupListComponent from "@/components/Group/GroupListComponent.vue";
import { useGroupStore } from "@/stores/group";
import { useLocationStore } from "@/stores/locate";
import MapComponent from "@/components/Locate/MapComponent.vue";
import SearchComponent from "@/components/Locate/SearchComponent.vue";
import { Loader } from "@googlemaps/js-api-loader"

const { GMAPS_API_KEY } = useLocationStore();
const loader = new Loader({
  apiKey: GMAPS_API_KEY,
  version: "weekly",
  libraries: ["maps", "places", "marker", "geometry"],
});

const groupStore = useGroupStore();
const locationStore = useLocationStore();
const { isLoggedIn } = storeToRefs(useUserStore());
const { isMapActive } = storeToRefs(locationStore);
const { isCreatingGroup, groupView } = storeToRefs(groupStore);

const navigate = () => {
  void router.push({ name: "Login" });
}

onBeforeMount(() => {
  locationStore.setCurrentLocation();
})
</script>

<template>
  <main>
    <CreateGroupForm
      v-if="isCreatingGroup && isLoggedIn"
      :group-type="groupStore.groupView"
      :gmaps-loader="loader">
    </CreateGroupForm>
    <section v-if="isLoggedIn" class="vertical">
      <SearchComponent :gmaps-loader="loader"></SearchComponent>
      <section class="content-panel">
        <MapComponent v-if="isMapActive" :gmaps-loader="loader"></MapComponent>
        <Suspense v-else >
          <GroupListComponent :group-type="groupView"/>
          <template #fallback>
            <p class="centered">Content is being loaded...</p>
          </template>
        </Suspense>
      </section>
      <button @click="locationStore.toggleMap(!isMapActive)">
        {{ isMapActive ? "Show list" : "Show map" }}
        <v-icon v-if="isMapActive" name="fa-list" fill="white"></v-icon>
        <v-icon v-else name="fa-map" fill="white"></v-icon>
      </button>
    </section>
    <section v-else class="column">
      <h1>Login to view this content</h1>
      <button @click="navigate">Login</button>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.content-panel {
  background-color: var(--light-gray);
  height: 75%;
}

button {
  position: absolute;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem;
  border: none;
  border-radius: 2rem;
  background-color: black;
  -webkit-text-fill-color: white;
  transition: transform 0.3s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button:hover {
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%) scale(1.1);
}
</style>

<script setup lang="ts">
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { useLocationStore } from "@/stores/locate";
import { ref, defineProps, onBeforeMount } from "vue";

const props = defineProps(["groupType", "gmapsLoader"]);
const groupStore = useGroupStore();
const userStore = useUserStore();
const locationStore = useLocationStore();

const loader = ref(props.gmapsLoader);
const name = ref("");
const capacity = ref(0);
const isPrivate = ref(false);
const moveInDate = ref();
const moveOutDate = ref();

const cancelCreate = () => {
  groupStore.setIsCreatingGroup(false);
};

const handleCreate = async () => {
  const location = await locationStore.saveLocation("home");
  await groupStore.createGroup(name.value, props.groupType, isPrivate.value.toString(), capacity.value, location._id, moveInDate.value, moveOutDate.value);
  await userStore.updateSession();
  cancelCreate();
}

onBeforeMount(async () => {
  loader
    .value
    .load()
    //@ts-ignore
    .then((google) => {
      const auto = new google.maps.places.Autocomplete(
        document.getElementById("create-location-input") as HTMLInputElement);
      locationStore.setAutocomplete(auto, "create");
    })
    .catch((e: any) => {
      console.error(`Failed to load Google Maps API: ${e}`);
    });
});
</script>

<template>
  <section class="modal centered">
    <section class="content">
      <form @submit.prevent="handleCreate">
        <fieldset class="form-group">
          <legend>New {{ groupType }} group</legend>
          <label for="group-name">Group name</label>
          <input v-model.trim="name" type="text" placeholder="Enter a name" required />
        </fieldset>

        <fieldset class="form-group">
          <label for="group-capacity">Capacity</label>
          <input v-model.trim="capacity" type="number" placeholder="Max members" required />
        </fieldset>

        <fieldset class="form-group">
          <label for="group-privacy">Privacy</label>
          <input v-model.trim="isPrivate" type="checkbox" />
        </fieldset>

        <fieldset class="form-group">
          <label for="homeLocation">
            {{ groupType == 'roommate' ? "Where I'm living: " : "Location: " }}
            <input id="create-location-input" type="text" placeholder="Enter a location" required />
          </label>
        </fieldset>

        <fieldset v-if="groupType == 'roommate'" class="form-group">
          <label for="moveOutDate">
            Movein:
            <input v-model.trim="moveInDate" id="movein-date-input" type="date" required/>
          </label>
          <label for="moveInDate">
            Moveout:
            <input v-model.trim="moveOutDate" id="moveout-date-input" type="date" required >
          </label>
        </fieldset>

        <fieldset class="pure-control-group" style="justify-content: space-evenly; display: flex;">
          <button class="pure-button pure-button-primary" @click="cancelCreate()">Cancel</button>
          <button type="submit" class="pure-button pure-button-primary">Create</button>
        </fieldset>
      </form>
    </section>
  </section>
</template>

<style scoped>
form {
  margin: auto;
  padding: 2rem;
}

fieldset {
  border: none;
  padding: 0;
}

label {
  flex: 1;
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
  width: 100%;
}
</style>
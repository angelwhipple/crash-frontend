<script setup lang="ts">
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps(["groupType"]);
const emit = defineEmits(["changeCommunity"]);

const groupStore = useGroupStore();
const userStore = useUserStore();

const name = ref("");
const capacity = ref(0);
const isPrivate = ref(false);

const cancelCreate = () => {
  groupStore.setIsCreatingGroup(false);
};

const handleCreate = async () => {
  const response = await groupStore.createGroup(name.value, props.groupType, isPrivate.value.toString(), capacity.value);
  await userStore.updateSession();
  emit("changeCommunity", response.group._id);
  cancelCreate();
}
</script>

<template>
  <section class="modal centered">
    <section class="content">
      <form>
        <fieldset class="form-group" @submit.prevent="handleCreate">
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

        <fieldset v-if="groupType == 'roommate'" class="form-group">
          <label for="homeLocation">I am living...</label>
          <input type="text" placeholder="Enter a location" />
          <label for="workLocation">I am working from...</label>
          <input type="text" placeholder="Enter a location" />
        </fieldset>

        <button class="pure-button pure-button-primary" @click="cancelCreate()">Cancel</button>
        <button type="submit" class="pure-button pure-button-primary">Create</button>
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
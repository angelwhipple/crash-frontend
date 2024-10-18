<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { useGroupStore } from "@/stores/group";
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps(["groupType"]);
const emit = defineEmits(["cancelCreate", "newGroup"]);

const { createGroup } = useGroupStore();

const name = ref("");
const capacity = ref(0);
const isPrivate = ref(false);
const groupType = ref(props.groupType);

const cancelCreate = () => {
  emit("cancelCreate");
};

const handleCreate = async () => {
  console.log(isPrivate.value);
  const response = await createGroup(name.value, isPrivate.value.toString(), capacity.value);
  console.log(response);
  emit("newGroup");
}

</script>

<template>
  <section class="modal centered">
    <section class="content">
      <h4>Create a new {{groupType}}</h4>
      <form class="pure-form pure-form-aligned" @submit.prevent="handleCreate">
        <div class="pure-control-group">
          <label for="aligned-name">Name</label>
          <input v-model.trim="name" id="aligned-name" type="text" placeholder="Community name" required />
        </div>
        <div class="pure-control-group">
          <label for="aligned-capacity">Capacity</label>
          <input v-model.trim="capacity" id="aligned-capacity" type="number" required />
        </div>
        <div class="pure-control-group">
          <label for="aligned-privacy">Private</label>
          <input v-model.trim="isPrivate" id="aligned-privacy" type="checkbox" required />
        </div>
        <div class="pure-controls">
          <button @click="cancelCreate()">Cancel</button>
        </div>
        <div class="pure-controls">
          <button @click="handleCreate()">Create</button>
        </div>
      </form>
    </section>
  </section>
</template>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal .content {
  position: absolute;
  background-color: white;
  width: 60%;
  height: 60%;
  animation: fadeIn 0.3s;
  border-radius: 1em;
}
</style>
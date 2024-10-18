<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { ObjectId } from "mongodb";

const props = defineProps(["id"]);
const { loadGroup, joinGroup, leaveGroup } = useGroupStore();
const { fetchSessionUser } = useUserStore();

const group = ref(await loadGroup(props.id));
const currentUser = await fetchSessionUser();

const refreshGroup = async () => {
  group.value = await loadGroup(props.id);
}

const isOwner = computed(() => currentUser._id.toString() === group.value.owner.toString());

const isMember = computed(() => {
  return group.value.members.some((member: string) => member.toString() === currentUser._id.toString());
});

const join = async () => {
  await joinGroup(props.id, currentUser._id);
  await refreshGroup();
}

const leave = async () => {
  await leaveGroup(props.id, currentUser._id);
  await refreshGroup();
}
</script>

<template>
  <div class="container">
    <h4>{{group.name}}</h4>
    <p>{{group.members.length}} members</p>
    <div class="actions">
      <button v-if="isMember" @click="leave()">Leave group</button>
      <button v-else @click="join()">Join group</button>
      <button v-if="isOwner">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  border: 0.1rem solid;
  border-radius: 1rem;
  padding: 2%;
  width: 20%;
  height: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}

.container .actions {
  display: flex;
  justify-content: space-around;
}
</style>
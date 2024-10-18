<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const props = defineProps(["group", "groupType"]);
const groupStore = useGroupStore();
const userStore = useUserStore();
const { currentUser } = storeToRefs(userStore);

const group = ref(props.group);

const refreshGroup = async () => {
  group.value = await groupStore.loadGroup(props.group._id);
}

const isOwner = computed(() => currentUser.value!._id.toString() === group.value.owner.toString());
const isMember = computed(() => {
  return group.value.members.some((member: string) => member.toString() === currentUser.value!._id.toString());
});

const join = async () => {
  await groupStore.joinGroup(group.value._id, currentUser.value!._id);
  await refreshGroup();
  await userStore.updateSession();
}

const leave = async () => {
  await groupStore.leaveGroup(group.value._id, currentUser.value!._id);
  await refreshGroup();
  await userStore.updateSession();
}

const disband = async () => {
  await groupStore.deleteGroup(group.value._id);
  await refreshGroup();
  await userStore.updateSession();
}
</script>

<template>
  <div class="container">
    <h4>{{group.name}}</h4>
    <p>{{group.members.length}} members</p>
    <div class="actions">
      <button v-if="isMember" @click="leave()">Leave group</button>
      <button v-else @click="join()">Join group</button>
      <button v-if="isOwner" @click="disband()">Disband</button>
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
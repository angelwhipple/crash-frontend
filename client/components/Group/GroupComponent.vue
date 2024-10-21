<script setup lang="ts">
import { computed, ref, defineProps, defineEmits, onBeforeMount } from "vue";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { useRequestStore } from "@/stores/request";
import { storeToRefs } from "pinia";

const props = defineProps(["groupId", "groupType"]);
const groupStore = useGroupStore();
const userStore = useUserStore();
const requestStore = useRequestStore();
const { currentUser } = storeToRefs(userStore);

const group = ref(await groupStore.loadGroup(props.groupId));
const requests = ref([]);

const isOwner = computed(() => currentUser.value!._id.toString() === group.value.owner.toString());
const isMember = computed(() => {
  return group.value.members.some((member: string) => member.toString() === currentUser.value!._id.toString());
});
const isRequested = computed(() => {
  return requests.value.some((request: any) => {
    return request.sender.toString() === currentUser.value!._id.toString();
  })
})

const join = async () => {
  await groupStore.joinGroup(group.value._id, currentUser.value!._id);
  await refreshGroup();
  await userStore.updateSession();
}

const request = async () => {
  await requestStore.makeRequest(props.groupId, "group");
  await refreshRequests();
}

const withdrawRequest = async () => {
  const request: any = requests.value.find((request: any) => request.sender.toString() === currentUser.value!._id.toString());
  await requestStore.withdrawRequest(request!._id);
  await refreshRequests();
}

const leave = async () => {
  await groupStore.leaveGroup(group.value._id, currentUser.value!._id);
  await refreshGroup();
  await userStore.updateSession();
}

const disband = async () => {
  await groupStore.deleteGroup(group.value._id);
  await userStore.updateSession();
}

const refreshGroup = async () => {
  group.value = await groupStore.loadGroup(props.groupId);
}

const refreshRequests = async () => {
  requests.value = await requestStore.getRequestsByResource(props.groupId, 'group')
}

onBeforeMount(async () => {
  try {
    await refreshRequests();
  } catch {}
});
</script>

<template>
  <div class="container">
    <section class="info">
      <h4>{{group.name}}</h4>
      <p class="opaque text-sm">Location</p>
      <p class="text-sm">{{group.members.length}} members</p>
    </section>
    <section class="actions">
      <span v-if="isOwner">
        <button @click="disband()" class="text-sm">Disband</button>
      </span>
      <span v-else>
        <button v-if="isMember" class="text-sm" @click="leave()">Leave group</button>
        <button v-else-if="group.privacy && isRequested" class="text-sm" @click="withdrawRequest()">Unrequest</button>
        <button v-else-if="group.privacy && !isRequested" class="text-sm" @click="request()">Request</button>
        <button v-else @click="join()" class="text-sm">Join group</button>
      </span>
    </section>
  </div>
</template>

<style scoped>
.container {
  border-radius: 1rem;
  padding: 2%;
  width: 15%;
  height: 25%;
  flex-shrink: 0;
  display: flex;
  background-color: white;
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
}

.container .info {
  width: 75%;
}

.container .actions {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 25%;
}

button {
  background-color: var(--primary);
  -webkit-text-fill-color: white;
  border: transparent;
  border-radius: 1rem;
  padding: 0.5rem;
  transition: transform 0.3s ease;
}

button:hover {
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
  transform: scale(1.1);
}
</style>
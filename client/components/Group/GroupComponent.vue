<script setup lang="ts">
import { computed, ref, defineProps, onBeforeMount } from "vue";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { useRequestStore } from "@/stores/request";
import { useLocationStore } from "@/stores/locate";
import { storeToRefs } from "pinia";
import { dateFromString } from "@/utils/formatDate";

const props = defineProps(["group", "groupType", "isInfoWindow"]);
const groupStore = useGroupStore();
const userStore = useUserStore();
const requestStore = useRequestStore();
const locationStore = useLocationStore();
const { currentUser } = storeToRefs(userStore);

const group = ref(props.group);
const location = ref();
const requests = ref([]);
const livingOptions = ref();

const isOwner = computed(() => currentUser.value!._id.toString() === group.value.owner.toString());
const isMember = computed(() => {
  return group.value.members.some((member: string) => member.toString() === currentUser.value!._id.toString());
});
const isPendingRequest = computed(() => {
  return requests.value.some((request: any) => {
    return request.status == 'pending' && request.sender.toString() === currentUser.value!._id.toString();
  })
})

const join = async () => {
  await groupStore.joinGroup(group.value._id, currentUser.value!._id);
  await refreshGroup();
  await userStore.updateSession();
}

const request = async () => {
  await requestStore.makeRequest(group.value._id, "group");
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
  group.value = await groupStore.loadGroup(group.value._id);
}

const refreshRequests = async () => {
  requests.value = await requestStore.getRequestsByResource(group.value._id, 'group')
}

const refreshLocation = async () => {
  location.value = await locationStore.fetchLocation(group.value.location);
}

const refreshLivingOptions = async () => {
  if (group.value.category == 'roommate') {
    livingOptions.value = await groupStore.loadLivingOptions(group.value._id);
  }
}

onBeforeMount(async () => {
  try {
    await refreshLocation();
    await refreshRequests();
    await refreshLivingOptions();
  } catch {}
});
</script>

<template>
  <div :class="isInfoWindow ? 'info-window' : 'card'">
    <section class="info">
      <a><b>{{group.name}}</b></a>
      <p v-if="location" class="opaque text-sm">{{ location.city }}, {{ location.state }}, {{ location.country }}</p>
      <p v-if="group.category === 'community'" class="text-sm">{{group.members.length}} members</p>
      <p v-else class="text-sm">{{group.members.length}} / {{group.capacity}} members</p>
      <p v-if="livingOptions" class="text-sm">Seeking accommodations from {{ dateFromString(livingOptions.moveIn).toLocaleDateString() }} to {{ dateFromString(livingOptions.moveOut).toLocaleDateString() }}</p>
    </section>
    <hr style="color:var(--light-gray)">
    <section class="bottom-pane">
      <p class="opaque text-sm">
        Open since {{ dateFromString(group.dateCreated).toLocaleDateString() }}
      </p>
      <span v-if="userStore.isLoggedIn">
        <button v-if="isOwner" @click="disband()" class="text-sm">Disband</button>
        <button v-else-if="isMember" class="text-sm" @click="leave()">Leave</button>
        <button v-else-if="group.privacy && isPendingRequest" class="text-sm" @click="withdrawRequest()">Unrequest</button>
        <button v-else-if="group.privacy && !isPendingRequest" class="text-sm" @click="request()">Request</button>
        <button v-else @click="join()" class="text-sm">Join</button>
      </span>
    </section>
  </div>
</template>

<style scoped>
hr {
  border: none;
  border-top: 0.1px solid rgba(207, 207, 207, 0.83); /* Thin light gray border */
  margin: 0; /* Space around the hr */
}

p {
  margin: 0;
}

.card {
  background-color: white;
  width: 30%;
  height: 50%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-radius: 1rem;
  transition-duration: 0.3s;
}

.card:hover {
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.3)
}

.info-window {
  width: 25vw;
  height: 20vh;
  display: flex;
  flex-direction: column;
}

section .info {
  height: 80%;
  padding: 1rem;
}

section .bottom-pane {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

section .bottom-pane button {
  background-color: inherit;
  opacity: 0.5;
  border: none;
  transition-duration: 0.3s;
  font-weight: bold;
  margin-left: auto;
}

section .bottom-pane button:hover {
  opacity: 1;
  -webkit-text-fill-color: var(--primary);
}
</style>
<script setup lang="ts">
import { computed, ref, defineProps, defineEmits, onBeforeMount } from "vue";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { useRequestStore } from "@/stores/request";
import { storeToRefs } from "pinia";
import { dateFromString } from "@/utils/formatDate";

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
  <div class="card">
    <section class="info">
      <a><b>{{group.name}}</b></a>
      <p class="opaque text-sm">Location</p>
      <p class="text-sm">{{group.members.length}} members</p>
    </section>
    <hr style="color:var(--light-gray)">
    <section class="bottom-pane">
      <p class="opaque text-sm">
        Open since {{ dateFromString(group.dateCreated).toLocaleDateString() }}
      </p>
      <button v-if="isOwner" @click="disband()" class="text-sm">Disband</button>
      <button v-else-if="isMember" class="text-sm" @click="leave()">Leave</button>
      <button v-else-if="group.privacy && isPendingRequest" class="text-sm" @click="withdrawRequest()">Unrequest</button>
      <button v-else-if="group.privacy && !isPendingRequest" class="text-sm" @click="request()">Request</button>
      <button v-else @click="join()" class="text-sm">Join</button>
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

.card .info {
  height: 80%;
  padding: 1rem;
}

.card .bottom-pane {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.card .bottom-pane button {
  background-color: inherit;
  opacity: 0.5;
  border: none;
  transition-duration: 0.3s;
  font-weight: bold;
  margin-left: auto;
}

.card .bottom-pane button:hover {
  opacity: 1;
  -webkit-text-fill-color: var(--primary);
}
</style>
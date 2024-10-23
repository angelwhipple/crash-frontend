<script setup lang="ts">
import { ref, defineProps, defineEmits, onBeforeMount, computed} from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useRequestStore } from "@/stores/request";
import { useGroupStore } from "@/stores/group";
import { dateFromString } from "@/utils/formatDate";
import _ from 'lodash';

const props = defineProps(["requestId"]);
const emit = defineEmits(["updateRequest"])
const userStore = useUserStore();
const requestStore = useRequestStore();
const groupStore = useGroupStore();
const { currentUser } = storeToRefs(userStore);

const request = ref();
const resource = ref()
const sender = ref();
const recipient =  ref();

const isRecipient = computed(() => {
  if (!recipient.value) return false;
  return currentUser.value!._id.toString() === recipient.value!._id.toString();
});

async function refreshRequest() {
  request.value = await requestStore.fetchRequest(props.requestId);
  sender.value = await userStore.fetchUser(request.value.sender);
  recipient.value = await userStore.fetchUser(request.value.recipient);
  resource.value = await groupStore.loadGroup(request.value.resource);
}

async function accept() {
  await requestStore.acceptRequest(request.value._id);
  await refreshRequest();
  emit("updateRequest");
}

async function decline() {
  await requestStore.declineRequest(request.value._id);
  await refreshRequest();
  emit("updateRequest");
}

async function withdraw() {
  await requestStore.withdrawRequest(request.value._id);
  emit("updateRequest");
}

onBeforeMount(async () => {
  await refreshRequest();
})
</script>

<template>
  <section class="request-box">
    <p v-if="isRecipient"><b>{{ sender?.username }} requested to join {{ resource?.name }}</b></p>
    <p v-else><b>You requested to join {{ resource?.name }}</b></p>

    <section v-if="request?.status == 'pending'">
      <p class="opaque">{{ _.capitalize(request?.status) }} since {{ dateFromString(request?.dateCreated).toLocaleDateString() }}</p>
      <div v-if="isRecipient" class="actions">
        <button class="text-sm" @click="accept()">
          Accept
        </button>
        <button class="text-sm" @click="decline()">
          Decline
        </button>
      </div>
      <button v-else class="text-sm" @click="withdraw()">
        Withdraw
      </button>
    </section>

    <p v-else class="opaque">
      {{ _.capitalize(request?.status) }} on {{ dateFromString(request?.dateCreated).toLocaleDateString() }}
    </p>
  </section>
</template>

<style scoped>
p {
  margin: 0;
}

.request-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 20%;
  border-radius: 0.5rem;
  padding: 0.5rem;
  transition-duration: 0.3s;
}

.request-box:hover {
  background-color: var(--light-gray);
}

.actions {
  display: flex;
  align-items: center;
  column-gap: 1rem;
  padding: 0.5rem;
}

.request-box button {
  background-color: inherit;
  border: none;
  font-weight: bold;
  transition-duration: 0.3s;
}

.request-box button:hover {
  -webkit-text-fill-color: var(--primary);
}
</style>
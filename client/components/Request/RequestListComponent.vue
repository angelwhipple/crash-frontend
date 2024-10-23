<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useRequestStore } from "@/stores/request";
import { RequestDoc } from "../../../server/concepts/requesting";
import RequestComponent from "@/components/Request/RequestComponent.vue";

const requestStore = useRequestStore();

const requests = ref<RequestDoc[]>([]);
const statusFilter = ref("all");

const filteredRequests = computed(() => {
  switch(statusFilter.value) {
    case 'pending':
      return requests.value.filter((request) => request.status === statusFilter.value);
    case 'resolved':
      return requests.value.filter((request) => request.status !== 'pending');
    default: return requests.value;
  }
})

async function refreshRequests() {
  requests.value = await requestStore.getRequestsByUser();
}

function setFilter(filter: string) {
  statusFilter.value = filter;
}

onBeforeMount(async () => {
  try {
    await refreshRequests();
  } catch {}
});
</script>

<template>
  <section class="filter-box">
    <button :class="{ active: statusFilter == 'all' }" @click="setFilter('all')">All</button>
    <button :class="{ active: statusFilter == 'pending' }" @click="setFilter('pending')">Pending</button>
    <button :class="{ active: statusFilter == 'resolved' }" @click="setFilter('resolved')">Resolved</button>
  </section>
  <section class="content-box">
    <RequestComponent
      v-for="request in filteredRequests"
      :key="request._id.toString()"
      :request-id="request._id"
      @update-request="refreshRequests()"
    />
  </section>
</template>

<style scoped>
.filter-box {
  width: 80%;
  height: 10%;
  padding: 0.5rem;
  align-items: center;
  border: none;
  background-color: white;
  border-radius: 0.5rem;
}

.filter-box button {
  height: 100%;
  padding: 2%;
  background-color: inherit;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0.1rem;
  font-weight: bold;
}

.filter-box button:hover {
  background-color: var(--light-gray);
  transition-duration: 0.3s;
}

.filter-box button.active {
  -webkit-text-fill-color: var(--primary);
  border-bottom: 0.2rem solid var(--primary);
}

.content-box {
  width: 80%;
  height: 70%;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-y: scroll;
}
</style>
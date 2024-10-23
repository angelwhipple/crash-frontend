<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";
import { ref } from "vue";
import UserDetail from "@/components/Setting/UserDetail.vue";
import RequestListComponent from "@/components/Request/RequestListComponent.vue";

const { currentUser } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

const activeTab = ref('details')
const isEditing = ref(false);

function changeTab(tab: string) {
  activeTab.value = tab;
}

function toggleEdit(editing: boolean) {
  isEditing.value = editing;
}

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main style="display: flex;">
    <section class="sidebar">
      <button :class="{ active: activeTab == 'details' }" @click="changeTab('details')">
        <v-icon name="bi-person-circle"></v-icon>Personal details
      </button>
      <button :class="{ active: activeTab == 'groups' }" @click="changeTab('groups')">
        <v-icon name="io-people-circle-sharp"></v-icon>Groups
      </button>
      <button :class="{ active: activeTab == 'requests' }" @click="changeTab('requests')">
        <v-icon name="bi-inbox-fill"></v-icon>Requests
      </button>
      <button :class="{ active: activeTab == 'settings' }" @click="changeTab('settings')">
        <v-icon name="bi-gear-fill"></v-icon>Settings
      </button>
    </section>
    <section v-if="activeTab == 'details'" class="column main-page">
      <UpdateUserForm v-if="isEditing" @cancel-edit="toggleEdit(false)"/>
      <UserDetail v-else @edit="toggleEdit(true)"/>
    </section>
    <section v-else-if="activeTab == 'groups'" class="column main-page">
      <p>Group view</p>
    </section>
    <section v-else-if="activeTab == 'requests'" class="column main-page">
      <RequestListComponent/>
    </section>
    <section v-else-if="activeTab == 'settings'" class="column main-page">
      <h1>Logged in as {{ currentUser?.username }}</h1>
      <button class="pure-button pure-button-primary" @click="logout">Logout</button>
      <button class="button-error pure-button" @click="delete_">Delete User</button>
    </section>
  </main>
</template>

<style>
.sidebar {
  width: 25%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.sidebar button {
  background: inherit;
  border: transparent;
  height: 10%;
  opacity: 0.5;
  border-radius: 0.5rem;
  transition-duration: 0.3s;
  text-align: start;
  padding: 0.5rem;
  display: flex;
  column-gap: 0.5rem;
  align-items: center;
}

.sidebar button:hover {
  opacity: 1;
  -webkit-text-fill-color: var(--primary);
}

.sidebar button.active {
  opacity: 1;
  background-color: var(--light-gray);
}

.main-page {
  width: 75%;
  height: 100%;
  background-color: var(--light-gray);
}
</style>

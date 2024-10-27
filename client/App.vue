<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useGroupStore } from "@/stores/group";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const groupStore = useGroupStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const { groupView } = storeToRefs(groupStore);

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
    await groupStore.refreshAllGroups();
    await groupStore.filterGroups();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <RouterLink :to="{ name: 'Home' }">
        <h1 class="title">crash</h1>
      </RouterLink>
      <ul v-if="currentRouteName == 'Home'" class="center-toggle">
        <li
          title="Communities"
          :class="{ active: groupView == 'community' }"
          @click="groupStore.setGroupView('community')">
          <v-icon name="io-people-sharp" fill="var(--primary)" scale="1.25"></v-icon>
        </li>
        <li
          title="Roommates"
          :class="{ active: groupView == 'roommate' }"
          @click="groupStore.setGroupView('roommate')">
            <v-icon name="fa-house-user" fill="var(--primary)" scale="1.25"></v-icon>
        </li>
      </ul>
      <ul v-if="isLoggedIn">
        <li
          v-if="currentRouteName == 'Home'"
          @click="groupStore.setIsCreatingGroup(true)">
          <span v-if="groupView == 'community'">Create a community</span>
          <span v-else>Create a roommate group</span>
        </li>
        <li :class="{ active: currentRouteName == 'Profile' }" title="Profile">
          <RouterLink :to="{ name: 'Profile' }" :class="{ active: currentRouteName == 'Profile' }">
            <v-icon name="bi-person-fill" fill="var(--primary)" scale="1.25"></v-icon>
          </RouterLink>
        </li>
      </ul>
      <ul v-else>
        <li :class="{ active: currentRouteName == 'Login' }">
          <RouterLink :to="{ name: 'Login' }" :class="{ active: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 0 2em;
  background-color: white;
  display: flex;
  align-items: center;
}

.title {
  font-weight: normal;
  -webkit-text-fill-color: var(--primary);
}

h1 {
  font-size: 2em;
  margin: 0;
}

img {
  height: 2em;
}

a {
  font-size: large;
  text-decoration: none;
  -webkit-text-fill-color: black;
}

a:hover, a.active {
  -webkit-text-fill-color: var(--primary);
}

ul {
  margin: 0 0 0 auto;
  padding: 0;
  list-style-type: none;
  display: flex;
  align-items: center;
  flex-direction: row;
}

li {
  -webkit-text-fill-color: black;
  opacity: 0.5;
  padding: 1em;
  border-bottom: 2px solid transparent;
  transition-duration: 0.3s;
  cursor: pointer;
}

li:hover {
  opacity: 1;
  -webkit-text-fill-color: var(--primary);
}

li.active {
  opacity: 1;
  -webkit-text-fill-color: var(--primary);
  border-bottom: 0.2em solid var(--primary);
}

.center-toggle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>

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
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <RouterLink :to="{ name: 'Home' }">
        <h1>crash</h1>
      </RouterLink>
      <ul v-if="currentRouteName == 'Home'" class="center-toggle">
        <li
          :class="{ active: groupView == 'community' }"
          @click="groupStore.setGroupView('community')">Communities
        </li>
        <li
          :class="{ active: groupView == 'roommate' }"
          @click="groupStore.setGroupView('roommate')">Roommates
        </li>
      </ul>
      <ul v-if="isLoggedIn">
        <li
          v-if="currentRouteName == 'Home' && groupView == 'community'"
          @click="groupStore.setIsCreatingGroup(true)">
          Create a community
        </li>
        <li v-else-if="currentRouteName == 'Home' && groupView == 'roommate'">Create a roommate group</li>
        <li :class="{ active: currentRouteName == 'Profile' }">
          <RouterLink :to="{ name: 'Profile' }"> Profile </RouterLink>
        </li>
      </ul>
      <ul v-else>
        <li :class="{ active: currentRouteName == 'Login' }">
          <RouterLink :to="{ name: 'Login' }" > Login </RouterLink>
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
  padding: 1em 2em;
  background-color: #1D005F;
  display: flex;
  align-items: center;
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
  color: white;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

li {
  -webkit-text-fill-color: white;
  opacity: 0.5;
  transition-duration: 0.3s;
  cursor: pointer;
}

li:hover, li.active {
  opacity: 1;
}

.center-toggle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>

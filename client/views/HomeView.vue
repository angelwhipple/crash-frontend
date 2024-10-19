<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from "@/router";
import { computed, ref } from "vue";
import CreateGroupForm from "@/components/Group/CreateGroupForm.vue";
import GroupListComponent from "@/components/Group/GroupListComponent.vue";
import GroupDropdown from "@/components/Group/GroupDropdown.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const activeTab = ref("Browse");
const changeTab = (tab: string) => activeTab.value = tab;

const isCreating = ref(false);
const setCreating = (create: boolean) => isCreating.value = create;

const navigate = () => {
  void router.push({ name: "Login" });
}
</script>

<template>
  <main>
    <CreateGroupForm v-if="isCreating" @cancel-create="setCreating(false)" @new-group="" group-type="community"></CreateGroupForm>
    <section v-if="isLoggedIn" class="paneled">
      <section class="sidebar">
        <Suspense>
          <GroupDropdown group-type="community" @create-new="setCreating(true)"></GroupDropdown>
          <template #fallback>
            <p class="centered">Loading...</p>
          </template>
        </Suspense>
        <button :class="['sidebar-btn', { active: activeTab == 'Browse' }]" @click="changeTab('Browse')">Browse</button>
        <button :class="['sidebar-btn', { active: activeTab == 'Dashboard' }]" @click="changeTab('Dashboard')">Dashboard</button>
        <button :class="['sidebar-btn', { active: activeTab == 'Settings' }]" @click="changeTab('Settings')">Settings</button>
      </section>
      <section class="content">
        <Suspense v-if="activeTab == 'Browse'" >
          <GroupListComponent group-type="community"/>
          <template #fallback>
            <p class="centered">Content is being loaded...</p>
          </template>
        </Suspense>
        <div v-else-if="activeTab == 'Dashboard'">
          <h4>Community dashboard</h4>
        </div>
        <div v-else>
          <h4>Community settings</h4>
          <PostListComponent />
        </div>
      </section>
    </section>
    <section v-else class="column">
      <h1>Login to view this content</h1>
      <button @click="navigate" class="pure-button pure-button-primary">Take me there</button>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.paneled {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  overflow: hidden;
  padding: 1em;
}

.paneled .content {
  background-color: #D7D7D7;
  width: 70%;
  height: 80%;
  border-radius: 1em;
  padding: 1em;
  overflow-y: scroll;
}

.paneled .content::-webkit-scrollbar {
  display: none;
}

.sidebar {
  width: 20%;
  height: 75%;
  background-color: #D7D7D7;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly !important;
  border-radius: 1em;
}

.sidebar-btn {
  opacity: 0.5;
  background-color: inherit;
  border: none;
  cursor: pointer;
}

.sidebar-btn:hover {
  opacity: 1;
}

.sidebar-btn.active {
  opacity: 1;
  text-decoration: underline;
}
</style>

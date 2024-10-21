<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from "@/router";
import { ref, watch } from "vue";
import CreateGroupForm from "@/components/Group/CreateGroupForm.vue";
import GroupListComponent from "@/components/Group/GroupListComponent.vue";
import { useGroupStore } from "@/stores/group";

const EMPTY_COMMUNITY = { _id: null, name : 'No communities' };

const groupStore = useGroupStore();
const { isLoggedIn } = storeToRefs(useUserStore());
const { subscribedGroups, isCreatingGroup, groupView } = storeToRefs(groupStore);

const activeCommunity = ref(subscribedGroups.value.length > 0 ? subscribedGroups.value[0]._id.toString() : EMPTY_COMMUNITY);

const setCommunity = (id: string) => {
  activeCommunity.value = id;
}

const navigate = () => {
  void router.push({ name: "Login" });
}

watch(activeCommunity, (active) => {
  console.log('Set active community:', active);
}, { deep: true });

</script>

<template>
  <main>
    <CreateGroupForm
      v-if="isCreatingGroup && isLoggedIn"
      @change-community="setCommunity"
      group-type="community">
    </CreateGroupForm>
    <section v-if="isLoggedIn" class="vertical">
      <section class="search-panel">
        <div class="searchbar">
          <label>
            Who
            <input placeholder="Search for communities..." />
          </label>
          <label>
            Where
            <input placeholder="Search for places..." />
          </label>
        </div>
      </section>
      <hr>
      <section class="results-panel">
        <Suspense v-if="groupView == 'community'" >
          <GroupListComponent group-type="community"/>
          <template #fallback>
            <p class="centered">Content is being loaded...</p>
          </template>
        </Suspense>
        <PostListComponent v-else/>
      </section>
      <button>Show map</button>
    </section>
    <section v-else class="column">
      <h1>Login to view this content</h1>
      <button @click="navigate">Login</button>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.search-panel {
  width: 100%;
  height: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.results-panel {
  height: 75%;
}

.searchbar {
  width: 50%;
  height: fit-content;
  display: flex;
  border: 1px solid transparent;
  border-radius: 5rem;
  padding: 1rem;
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
}

.searchbar label {
  width: 50%;
}

.searchbar input {
  width: 70%;
  border-radius: 2rem;
  padding: 1rem;
  border: transparent;
  outline: none;
}

.searchbar input:focus, .searchbar input:hover {
  background-color: lightgray;
  transition-duration: 0.3s;
}

button {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem;
  border: none;
  border-radius: 1rem;
  background-color: black;
  -webkit-text-fill-color: white;
  transition: transform 0.3s ease;
}

button:hover {
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%) scale(1.1);
}
</style>

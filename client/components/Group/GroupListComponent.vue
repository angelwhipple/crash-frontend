<script setup lang="ts">
import { defineProps, computed } from "vue";
import { useGroupStore } from "@/stores/group";
import GroupComponent from "@/components/Group/GroupComponent.vue";
import { storeToRefs } from "pinia";

const props = defineProps(["groupType"]);

const { allGroups, filteredGroups } = storeToRefs(useGroupStore()); // TODO: revise, use filteredGroups
</script>

<template>
  <section class="scrollable">
    <GroupComponent
      v-for="group in filteredGroups"
      :key="group._id.toString()"
      :group="group"
      :group-type="props.groupType"
      :is-info-window="false">
    </GroupComponent>
  </section>
</template>

<style scoped>
.scrollable {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  padding: 2rem;
  column-gap: 2rem;
  row-gap: 2rem;
  overflow-y: scroll;
  justify-content: center;
}
</style>
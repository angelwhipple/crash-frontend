<script setup lang="ts">
import { ref, defineProps, watch } from "vue";
import { useGroupStore } from "@/stores/group";
import GroupComponent from "@/components/Group/GroupComponent.vue";
import { storeToRefs } from "pinia";

const props = defineProps(["groupType"]);

const { allGroups } = storeToRefs(useGroupStore());
</script>

<template>
  <section class="scrollable">
    <GroupComponent
      v-for="group in allGroups"
      :key="group._id.toString()"
      :group-id="group._id.toString()"
      :group-type="props.groupType" >
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
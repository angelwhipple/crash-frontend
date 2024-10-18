<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { useUserStore } from "@/stores/user";
import { useGroupStore } from "@/stores/group";
import { ObjectId } from "mongodb";

const props = defineProps(["groupType"]);
const emit = defineEmits(["createNew"])
const { fetchSessionUser } = useUserStore();
const { loadGroup, loadAllGroups } = useGroupStore();

const user = await fetchSessionUser();
// const subscribedGroups = user.groups.map(async (group: ObjectId) => await loadGroup(group));
const allGroups = await loadAllGroups();

const handleSelect = (event: any) => {
  if (event.target.value === `New ${props.groupType}`) emit('createNew');
}

</script>

<template>
    <select @change="handleSelect">
      <option id="group._id" v-for="group of allGroups">{{group.name}}</option>
      <option>New {{props.groupType}}</option>
    </select>
</template>

<style scoped>
select {
  align-self: center;
  width: 60%;
}

option {
  text-align: center;
}
</style>
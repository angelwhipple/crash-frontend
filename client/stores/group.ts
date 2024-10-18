import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";

export const useGroupStore = defineStore(
  "group",
  () => {
  const loadAllGroups = async () => {
    return await fetchy("/api/groups", "GET", {});
  }

  const loadGroup = async (id: ObjectId) => {
    return await fetchy(`/api/groups/${id}`, "GET", {});
  }

  const joinGroup = async (id: ObjectId, user: string) => {
    return await fetchy(`/api/groups/members/add/${id}`, "PUT", { body: { user } });
  }

  const leaveGroup = async (id: ObjectId, member: string) => {
    return await fetchy(`/api/groups/members/remove/${id}`, "PUT", { body: { member } });
  }

  const createGroup = async(name: string, privacy: string, capacity: number) => {
    return await fetchy("/api/groups", "POST", { body: { name, capacity, privacy } });
  }

  return {
    loadAllGroups,
    loadGroup,
    joinGroup,
    leaveGroup,
    createGroup,
  }
},
  { persist: true },
)
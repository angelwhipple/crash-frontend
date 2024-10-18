import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");
    const subscribedGroups = ref([]);

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
    };

    const createUser = async (email: string, username: string, password: string) => {
      await fetchy("/api/users", "POST", {
        body: { email, username, password },
      });
    };

    const fetchSessionUser = async () => {
      return await fetchy(`/api/session`, "GET", {});
    };

    const fetchUserByEmail = async (email: string) => {
      return await fetchy(`/api/users/validate/${email}`, "GET", {});
    };

    const loginUser = async (email: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { email, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, groups } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        subscribedGroups.value = groups;
      } catch {
        currentUsername.value = "";
        subscribedGroups.value = [];
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUserUsername = async (username: string) => {
      await fetchy("/api/users/username", "PATCH", { body: { username } });
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
      await fetchy("/api/users/password", "PATCH", { body: { currentPassword, newPassword } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      isLoggedIn,
      createUser,
      fetchSessionUser,
      fetchUserByEmail,
      loginUser,
      updateSession,
      logoutUser,
      updateUserUsername,
      updateUserPassword,
      deleteUser,
    };
  },
  { persist: true },
);

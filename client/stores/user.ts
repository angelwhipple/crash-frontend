import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";
import { UserDoc } from "../../server/concepts/authenticating";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUser = ref<UserDoc>();

    const isLoggedIn = computed(() => currentUser.value !== undefined);

    const resetStore = () => {
      currentUser.value = undefined;
    };

    const fetchUser = async(id: string)=> {
      return await fetchy(`/api/users/${id}`, "GET", {});
    }

    const createUser = async (email: string, username: string, password: string) => {
      await fetchy("/api/users", "POST", {
        body: { email, username, password },
      });
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
        currentUser.value = await fetchy("/api/session", "GET", { alert: false });
      } catch {
        currentUser.value = undefined;
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUserLegalName = async (firstName: string, lastName: string) => {
      await fetchy("/api/users/legalname", "PATCH", { body: { firstName, lastName } });
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
      currentUser,
      isLoggedIn,
      createUser,
      fetchUser,
      fetchUserByEmail,
      loginUser,
      updateSession,
      logoutUser,
      updateUserLegalName,
      updateUserUsername,
      updateUserPassword,
      deleteUser,
    };
  },
  { persist: true },
);

import { defineStore } from "pinia";
import { fetchy } from "@/utils/fetchy";

export const useRequestStore = defineStore(
  "request",
  () => {

    const fetchRequest = async (requestId: string) => {
      return await fetchy(`/api/requests/${requestId}`, "GET", { alert: false });
    }

    const getRequestsByUser = async () => {
      return await fetchy("/api/requests", "GET", { alert: false });
    }

    const getRequestsByResource = async (resourceId: string, category: string) => {
      return await fetchy(`/api/requests/${category}/${resourceId}`, "GET", { alert: false });
    }

    const getUserRequestsByStatus = async(status: string) => {}

    const makeRequest = async (resourceId: string, category: string) => {
      return await fetchy(`/api/requests/${category}/${resourceId}`, "POST", {});
    }

    const acceptRequest = async(requestId: string) => {
      return await fetchy(`/api/requests/accept/${requestId}`, "PUT", { alert: false });
    }

    const declineRequest = async(requestId: string) => {
      return await fetchy(`/api/requests/decline/${requestId}`, "PUT", { alert: false });
    }

    const withdrawRequest = async (requestId: string)  => {
      return await fetchy(`/api/requests/${requestId}`, "DELETE", { alert: false });
    }

    return {
      fetchRequest,
      getRequestsByUser,
      getRequestsByResource,
      getUserRequestsByStatus,
      makeRequest,
      acceptRequest,
      declineRequest,
      withdrawRequest,
    }
  },
  { persist: true },
)
import { defineStore } from "pinia";
import { fetchy } from "@/utils/fetchy";

export const useRequestStore = defineStore(
  "request",
  () => {

    const fetchRequest = async (requestId: string) => {
      return await fetchy(`/api/requests/${requestId}`, "GET", {});
    }

    const getRequestsByUser = async () => {
      return await fetchy("/api/requests", "GET", {});
    }

    const getRequestsByResource = async (resourceId: string, category: string) => {
      return await fetchy(`/api/requests/${category}/${resourceId}`, "GET", {});
    }

    const getUserRequestsByStatus = async(status: string) => {}

    const makeRequest = async (resourceId: string, category: string) => {
      return await fetchy(`/api/requests/${category}/${resourceId}`, "POST", {});
    }

    const acceptRequest = async(requestId: string) => {
      return await fetchy(`/api/requests/accept/${requestId}`, "PUT", {});
    }

    const declineRequest = async(requestId: string) => {
      return await fetchy(`/api/requests/decline/${requestId}`, "PUT", {});
    }

    const withdrawRequest = async (requestId: string)  => {
      return await fetchy(`/api/requests/${requestId}`, "DELETE", {});
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
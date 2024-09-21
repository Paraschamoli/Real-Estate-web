import { create } from "zustand";
import apiRequest from "./apiRequest.js";

export const useNotificationStore = create((set) => ({
  number: 0,
  loading: false,
  error: null,

  // Fetch notification count from API
  fetch: async () => {
    try {
      set({ loading: true, error: null }); // Start loading and reset error
      const res = await apiRequest.get("/user/notification");
      set({ number: res.data, loading: false });
    } catch (error) {
      set({ loading: false, error: "Failed to fetch notifications" });
    }
  },

  // Decrease notification count but don't allow negative numbers
  decrease: () => {
    set((prev) => ({
      number: prev.number > 0 ? prev.number - 1 : 0,
    }));
  },

  // Reset the notification count to zero
  reset: () => {
    set({ number: 0 });
  },
}));

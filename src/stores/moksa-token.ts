
import { writable } from "svelte/store";

const createTokenStore = () => {
  const { subscribe, set, update } = writable(null);
  return {
    subscribe,
    set: (data) => {
      set(data);
    },
    update: (updater) => {
      update((current) => {
        const updatedData = updater(current);
        return updatedData;
      });
    },
  };
};

export const moksaToken = createTokenStore();

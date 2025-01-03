
import { writable } from "svelte/store";

const createTokenStore = () => {
  const { subscribe, set, update } = writable(null);
  return {
    subscribe,
    set: (data:any) => {
      set(data);
    },
    update: (updater:any) => {
      update((current) => {
        const updatedData = updater(current);
        return updatedData;
      });
    },
  };
};

export const moksaToken = createTokenStore();


import { writable } from "svelte/store";

const createMoksaUsers = () => {
  const { subscribe, set, update } = writable<any[]>([]);
  return {
    subscribe,
    set: (data: unknown[]) => {
      set(data);
    },
    update: (updater: (items: any[]) => unknown[]) => {
      update((current) => {
        const updatedData = updater(current);
        return updatedData;
      });
    },
  };
};

export const moksaUsers = createMoksaUsers();

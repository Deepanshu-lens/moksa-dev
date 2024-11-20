
import { writable } from "svelte/store";

const createEventsStore = () => {
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

export const allEvents = createEventsStore();
export const totalAllEvent = writable<number>(0);
export let isEventsLoading = writable<boolean>(false);

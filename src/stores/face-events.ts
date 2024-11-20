// @ts-nocheck
import type { Event } from "@/types";
import { writable } from "svelte/store";

const createEventsStore = () => {
  const { subscribe, set, update } = writable<Event[]>([]);
  return {
    subscribe,
    set: (data: unknown[]) => {
      //todo: validate here
      set(data);
    },
    update: (updater: (items: unknown[]) => unknown[]) => {
      update((current) => {
        let updatedData = updater(current);

        if (updatedData.length > 100) {
          updatedData = updatedData.slice(0, 100);
        }

        //todo: validate here
        return updatedData;
      });
    },
  };
};

export const faceEvents = createEventsStore();
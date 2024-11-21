import { writable } from "svelte/store";

const createGalleryStore = () => {
  const { subscribe, set, update } = writable<unknown[]>([]);
  return {
    subscribe,
    set: (data: unknown[]) => {
      //todo: validate here
      set(data);
    },
    update: (updater: (items: unknown[]) => unknown[]) => {
      update((current) => {
        const updatedData = updater(current);
        //todo: validate here
        return updatedData;
      });
    },
  };
};

export const gallery = createGalleryStore();
export const totalFaceRegistered = writable<number>(0);
export const isGalleryLoading = writable<boolean>(false);
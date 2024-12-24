import { writable } from "svelte/store";

const CreateRoiCamera = () => {
  const { subscribe, set, update } = writable<Object|null>(null);
  return {
    subscribe,
    set: (data: unknown[]) => {
        //todo: validate here
      set(data);
    },
    update: (updater: (items: unknown[]) => unknown[]) => {
      update((current:any) => {
        const updatedData = updater(current);
        //todo: validate here
        return updatedData;
      });
    },
  };
};

export const roiCamera = CreateRoiCamera();
 
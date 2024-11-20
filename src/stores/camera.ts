import { validateCameras, type Camera } from "@/types";
import { writable } from "svelte/store";

const createCameraStore = () => {
  const { subscribe, set, update } = writable<Camera[]>([]);
  return {
    subscribe,
    set: (data: unknown[]) => {
      const validCameras = validateCameras(data);
      set(validCameras);
    },
    update: (updater: (items: Camera[]) => unknown[]) => {
      update((current) => {
        const updatedData = updater(current);
        return validateCameras(updatedData);
      });
    },
  };
};

export const cameras = createCameraStore();
export const totalCameras = writable<number>(0);
export const selectedCamera = writable<string>("");
export const captureRef = writable<HTMLElement | null>(null);
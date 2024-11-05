import type { SelectedNode, Event } from "@/types";
import { writable } from "svelte/store";


export const events = writable<Event[]>([]);
export const otherEvents = writable<Event[]>([]);
export const runningEvents = writable<Event[]>([]);
export const selectedNode = writable<SelectedNode>();
export const convertedVideos = writable([]);
export const allVideos = writable([])
export const hoveredCamera = writable("");
export const activeCamera = writable("");
export const filteredNodeCameras = writable([])
export const uniqueUrlList = writable([])
export const fullscreen = persistedWritable("fullscreen", false);
export const alertPanelHide = persistedWritable("alertPanelHide", true);
export const markRoi = writable(false);
export const view = writable(1);
export const canvasCoordinates = writable({})
export const activePanel = writable("")
export const atlasEvents = writable([])
export const cameraCounts = writable<{ [cameraId: string]: number }>({});
export let tickets = writable([]);

function persistedWritable(key: string, defaultValue: boolean) {
  let value = defaultValue;

  // Check if running in a client environment
  if (typeof window !== "undefined") {
    const storedValue = localStorage.getItem(key);
    value = storedValue ? JSON.parse(storedValue) : defaultValue;
  }

  const store = writable(value);

  // Subscribe to store changes and update localStorage only if in client
  if (typeof window !== "undefined") {
    store.subscribe((newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    });
  }
  return store;
}


import { writable } from "svelte/store";

export const isAlertPanelOpen = writable<boolean>(false);
export const isAlertMobileOpen = writable<boolean>(false);
export const selectedLayout = writable<number>(
  typeof window !== "undefined"
    ? Number(localStorage.getItem("selectedLayout")) || 3
    : 3
);
export const customLayout = writable<{rows:number,columns:number}|null>(
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("customLayout") || "null")
    : null
);
export const isRoiPanelOpen = writable<boolean>(false);

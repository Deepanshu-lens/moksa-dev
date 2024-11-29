
import { writable } from "svelte/store";

export const isAlertPanelOpen = writable<boolean>(false);
export const isAlertMobileOpen = writable<boolean>(false);
export const selectedLayout = writable<number>(typeof window !== 'undefined' ? Number(localStorage.getItem("selectedLayout")) || 5 : 5);
export const isRoiPanelOpen = writable<boolean>(false);

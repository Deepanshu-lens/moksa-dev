
import { writable } from "svelte/store";

export const isAlertPanelOpen = writable<boolean>(false);
export const isAlertMobileOpen = writable<boolean>(false);
export const selectedLayout = writable<boolean>(false);

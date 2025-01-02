
import { writable } from "svelte/store";

const createTokenStore = () => {
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

export const moksaToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjgsImZpcnN0X25hbWUiOiJhbnVzaGl5YSIsImxhc3RfbmFtZSI6InAiLCJlbWFpbCI6ImFudXNoaXlhQGdtYWlsLmNvbSIsImlhdCI6MTczNTgwMzc0NywiZXhwIjoxNzM1ODkwMTQ3fQ.tnLqFGfz2iRw8UTbL79YaCnQ-CxPpjMzz42qVQbzUTc";

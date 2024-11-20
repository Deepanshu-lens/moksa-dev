import { writable } from "svelte/store";
import { validateNodes, type Node } from "@/types";

const createNodeStore = () => {
  const { subscribe, set, update } = writable<Node[] | undefined>(undefined);
  return {
    subscribe,
    set: (data: unknown[]) => {
      const validNodes = validateNodes(data);
      set(validNodes);
    },
    update: (updater: (items: Node[] | undefined) => unknown[]) => {
      update((current) => {
        const updatedData = updater(current);
        return validateNodes(updatedData);
      });
    },
  };
};

export const selectedNode = writable<string>();
export const nodes = createNodeStore();

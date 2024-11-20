import { atom } from "nanostores";
import type { User } from "@/types";
import { validateUser } from "@/types";

const createUserStore = () => {
  const store = atom<User | null>(null);

  return {
    subscribe: store.subscribe,
    set: (data: unknown) => {
      const validUser = validateUser(data);
      store.set(validUser);
    },
    update: (updater: (items: User | null) => unknown) => {
      const current = store.get();
      const updatedData = updater(current);
      store.set(validateUser(updatedData));
    },
    get: () => {
      return store.get();
    },
  };
};

export const user = createUserStore();

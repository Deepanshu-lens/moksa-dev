// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    type PocketBase = import("pocketbase").default;
    type User = {
      name: String;
      email: String;
    };

    interface Locals {
      pb?: PocketBase;
      user?: Record;
    }
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};

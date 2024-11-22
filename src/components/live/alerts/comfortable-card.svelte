<script lang="ts">
//   type Event = {
//   id: string;
//   collectionId: string;
//   collectionName: string;
//   created: string; // ISO date string
//   updated: string; // ISO date string
//   features: string; // Assuming JSON is stored as a string
//   name: string;
//   images: string; // Assuming JSON is stored as a string
//   template: string; // Assuming JSON is stored as a string
//   lastSeen: string; // ISO date string
//   events: string[]; // Array of relation record IDs
//   employee: boolean;
//   aadhar: string;
//   department: string;
//   mobile: number;
//   email: string;
//   shiftStartTime: string; // Assuming time is stored as a string
//   shiftEndTime: string; // Assuming time is stored as a string
//   blackList: boolean;
// }
  import { cn } from "@/lib/utils";
  import * as Card from "@/components/ui/card";
  export let event: any;
</script>

<Card.Root
  class="bg-[#333] text-white border-none"
>
  <Card.Content class=" h-full w-full flex items-start px-2 py-1 gap-4">
    <img
      src={"data:image/jpeg;base64," + event.images[0]}
      alt="profile"
      class=" h-16 w-16 aspect-square object-contain rounded-md my-auto"
      />
    <span class="flex flex-col gap-1.5 w-full">
      <span class="font-semibold">{event.name}</span>
      <div class="flex -space-x-2 overflow-hidden">
        {#each event.images as galleryImage}
          <img
            class="inline-block h-6 w-6 rounded-full ring-2 ring-black 3xl:w-16 3xl:h-16"
            src={"data:image/jpeg;base64," + galleryImage}
            alt=""
          />
        {/each}
      </div>
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <span
        class="block w-full h-[1px] bg-[#1c1c1c] dark:bg-slate-50 bg-opacity-10"
      />
      <span class="2xl:text-xs text-[10px] leading-tight">
        Last Seen:
        {#if event.lastSeen.length === 0}
          Not yet
        {:else}
          {new Date(event?.lastSeen).toLocaleString()}
        {/if}
      </span>
    </span>
  </Card.Content>
</Card.Root>
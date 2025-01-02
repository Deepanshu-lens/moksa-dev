<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { cn } from "@/lib";
  import type { Gallery } from "@/types";
  export let galleryItem: Gallery;
  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en";
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");
  export let isAllFullScreen: boolean;
</script>

<Card.Root
  class={isAllFullScreen
    ? "bg-[#333] text-white border-none"
    : "bg-[#f9f9f9] h-[95px] dark:bg-[#333] scale-[1.2] sm:scale-100"}
>
  <Card.Content class=" h-full w-full flex items-start px-2 py-1 gap-4">
    {#if galleryItem?.savedData?.length > 0}
      <img
        src={"data:image/jpeg;base64," + galleryItem.savedData?.[0]}
        alt="profile"
        class=" h-16 w-16 aspect-square object-contain rounded-md my-auto"
      />
    {/if}
    <span class="flex flex-col gap-1.5 w-full">
      <span class="font-semibold">{galleryItem.name}</span>
      <div class="flex -space-x-2 overflow-hidden">
        {#each galleryItem.images as galleryImage}
          <img
            class={cn(
              `inline-block h-6 w-6 rounded-full ring-2 ${isAllFullScreen ? "ring-black" : "ring-white"}`,
              "3xl:w-16 3xl:h-16",
            )}
            src={"data:image/jpeg;base64," + galleryImage}
            alt=""
          />
        {/each}
      </div>
      <span
        class="block w-full h-[1px] bg-[#1c1c1c] dark:bg-slate-50 bg-opacity-10"
      />
      <span class="2xl:text-xs text-[10px] leading-tight">
        Last Seen:
        {#if galleryItem.lastSeen.length === 0}
          Not yet
        {:else}
          {timeAgo?.format(new Date(galleryItem?.lastSeen))}
        {/if}
      </span>
    </span>
  </Card.Content>
</Card.Root>

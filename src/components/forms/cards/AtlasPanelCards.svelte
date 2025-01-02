<script lang="ts">
  import { Menu, Trash } from "lucide-svelte";
  import { activePanel } from "@/lib/stores";
  import { addUserLog } from "@/lib/addUserLog";
  export let panelData;

  function deletePanel(
    event: MouseEvent & { currentTarget: EventTarget & HTMLLIElement },
  ) {
    throw new Error("Function not implemented.");
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<article
  class={`flex  items-center gap-4 p-4 dark:border hover:border hover:border-primary rounded-xl shadow-md text-base z-10 w-full px-4
          ${panelData.id === $activePanel ? ` border animate-gradient-border bg-[#f9f9f9] dark:bg-black` : "bg-[#f9f9f9] dark:bg-black"}`}
  on:click={() => {
    addUserLog(`user selected panel ${panelData.name}!`);
    activePanel.update((previous) =>
      previous === panelData.id ? "" : panelData.id,
    );
  }}
>
  <Menu class=" h-4 w-4 my-handle cursor-grab flex-shrink-0" />
  <div class="grid gap-1">
    <h3 class="text-base capitalize">
      {panelData.name}
    </h3>
    <p class="text-xs">
      IP: {panelData.ip_addr}
    </p>
  </div>

  <ul class="flex flex-row gap-2 ml-auto p-0 list-none cursor-pointer">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <li class="cursor-pointer hover:scale-125" on:click={deletePanel}>
      <Trash class="size-4" />
    </li>
  </ul>
</article>

<script lang="ts">
  import { Menu, Trash } from "lucide-svelte";
  import DeletePanel from "@/components/atlas/dialoges/delete-panel.svelte";
  import { activePanel } from "@/stores";
  import { cn } from "@/lib/utils";

  export let panelData;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article
  class={cn("flex items-center gap-4 p-4 dark:border hover:border hover:border-brand-foreground dark:hover:border-brand rounded-xl shadow-md text-base z-10 w-full px-4 bg-[#f9f9f9] dark:bg-white/20",{"border border-black dark:border-white" : panelData.id === $activePanel})}
  on:click={() => {
    activePanel.update((previous) =>
      previous === panelData.id ? "" : panelData.id
    );
  }}
  >
  <Menu class=" h-4 w-4 my-handle cursor-grab flex-shrink-0" />
  <div
    class="grid gap-1 cursor-pointer"
  >
    <h3 class="text-base capitalize">
      {panelData?.name}
    </h3>
    <p class="text-xs">
      IP: {panelData?.ip_addr}
    </p>
  </div>

  <ul class="flex flex-row gap-2 ml-auto p-0 list-none cursor-pointer">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <DeletePanel>
      <li class="cursor-pointer hover:scale-125" >
        <Trash class="size-4" />
      </li>
    </DeletePanel>
  </ul>
</article>

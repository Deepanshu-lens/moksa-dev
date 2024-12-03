<script lang="ts">
  import PlaybackCard from "@/components/cards/mobile/PlaybackCard.svelte";
  import { ChevronRight } from "lucide-svelte";
  export let webmFiles;
</script>

<div class="h-[250px] flex flex-col mx-6 gap-2">
  <span class="flex items-center overflow-y-scroll gap-4 w-full">
    {#each webmFiles as video}
      <PlaybackCard {video} />
    {/each}
  </span>
</div>

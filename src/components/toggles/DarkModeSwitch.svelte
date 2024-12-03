<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Sun, Moon } from "lucide-svelte";
  import { toggleMode,mode } from "mode-watcher";
  // import { mode } from "$lib/stores";

  // console.log($mode)
</script>

<Button on:click={toggleMode} variant="ghost" size="icon" class='bg-[#061149] size-[40px] rounded-md p-1 border border-white/[.08] text-white'>
  {#if $mode !== "light"}
  <Sun 
size={22}
  />
  {:else}
  <Moon 
size={22}
  />
  {/if}
  <span class="sr-only">Toggle theme</span>
</Button>

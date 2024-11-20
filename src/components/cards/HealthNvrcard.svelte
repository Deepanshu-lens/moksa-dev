<script>
  import { HardDrive } from "lucide-svelte";
  import { Button } from "../ui/button";
  import PocketBase from "pocketbase";
  export let nvr;
  export let selectedNvr;

  console.log(nvr)
</script>

<article class="w-[250px] h-[130px] border-[#e4e4e4] rounded-md p-2 border">
  <span class="flex justify-between items-center w-full pb-4 border-b">
    <span class="flex gap-2 items-center">
      <span
        class="bg-primary bg-opacity-10 h-6 w-6 rounded-md grid place-items-center"
      >
        <HardDrive class="text-primary" size={16} /></span
      >
      <p class="text-sm font-semibold">{nvr.name}</p>
    </span>
    {#if nvr.status?.status === true}
      <span
        class="flex items-center gap-2 text-[#03A185] bg-[#03A185] bg-opacity-20 rounded-xl px-2 py-1 text-xs"

      >
        <span class="h-2 w-2 rounded-full bg-[#03A185]" />
        Active
      </span>
    {:else}
      <span
        class="flex items-center gap-2 text-[#B5496E] bg-[#B5496E] bg-opacity-20 rounded-xl px-2 py-1 text-sm"
      >
        <span class="h-2 w-2 rounded-full bg-[#B5496E]" />
        Inactive
      </span>
    {/if}
  </span>
  <p class="text-sm py-1">
    Location: <span class="font-semibold"
      >{nvr.expand?.ip_address?.location === undefined ? 'Not Configured' : nvr.expand?.ip_address?.location}</span
    >
  </p>
  <Button disabled={nvr.expand?.ip_address?.location === undefined}
    size="sm" class=' disabled:cursor-not-allowed'
    on:click={() =>selectedNvr.set({ ...nvr })}>View Details</Button
  >
</article>

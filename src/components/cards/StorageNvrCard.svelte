<script>
  import { ServerIcon } from "lucide-svelte";
  export let sd;

  console.log(sd)
</script>

<article class="w-[250px] h-[130px] border-[#e4e4e4] rounded-md p-2 border">
  <span class="flex items-center justify-between border-b mx-2">
    <span class="flex items-center justify-between gap-2 pb-2">
      <ServerIcon size={24} class="text-primary" />
      <span
        ><p class="text-lg font-bold whitespace-nowrap">{sd.name?.length !== 0 ? sd.name : undefined}</p>
      </span
      >
    </span>
    {#if sd?.status === "ok"}<span
        class="flex items-center gap-2 text-xs text-[#03A185] bg-[#03A185] bg-opacity-15 rounded-xl px-2 py-1"
        ><span class="h-2 w-2 bg-[#03A185] rounded-full" /> Active</span
      >{:else}<span
        class="flex items-center gap-2  text-xs text-[#B5496E] bg-[#B5496E] bg-opacity-15 rounded-xl px-2 py-1"
        ><span class="h-2 w-2 bg-[#B5496E] rounded-full" /> Inactive</span
      >
    {/if}
  </span>
  <span class="flex pt-2 flex-col">
    <span class="flex items-center gap-2">
        <p class=" whitespace-nowrap text-sm text-[#727272]">
            NVR: <span class="text-sm text-primary font-medium">{sd?.expand?.nvr?.name}</span>
        </p>
        <p class=" whitespace-nowrap text-sm text-[#727272]">
            Type: <span class="text-sm text-primary font-medium">{sd?.type}</span>
        </p>
    </span>
<span class="flex items-center gap-2">
    <p class="text-sm text-[#727272]">
        Total: <span class="text-sm text-primary font-medium">{(sd.capacity / 1024 / 1024).toFixed(2)} TB</span>
    </p>
    <p class="text-sm text-[#727272]">
        Free: <span class="text-sm text-primary font-medium">{(sd.free_space / 1024 / 1024).toFixed(2)} TB</span>
    </p>
</span>
      <div class="relative pt-1">
        <div class="overflow-hidden h-2 text-xs flex rounded bg-[#d6d6d6] w-full">
          <div style="width:{(1 - sd.free_space / sd.capacity) * 100}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
        </div>
      </div>
    </span>
</article>

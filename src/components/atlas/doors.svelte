<script lang="ts">
  import { Camera, LockKeyhole } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import CameraDoor from "@/components/atlas/dialoges/camera-door.svelte";
  import Separator from "@/components/ui/separator/separator.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import { activePanel } from "@/stores";

  export let data;
  export let search: string;
  let showChildren = null;
  let selectedChild: any = null;

  // const API_URL = `https://view.lenscorp.cloud/atlasbackend/unlock/${$activePanel}`;

  const API_URL = `https://api.cieloview.com/unlock/${$activePanel}`;

  $: filteredDoors = data?.filter((door: any) =>
    door.name.toLowerCase().includes($search.toLowerCase())
  );

  async function handleUnlock(doorId: any) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          unId: doorId,
        }),
      });
      if (res.ok) toast(`Door with unid:${doorId} unlocked successfully!`);
    } catch (error) {
      console.error("Error unlocking door:", error);
      // toast.error("Error unlocking door!");
    }
  }
</script>

<div class="flex justify-start flex-wrap items-start px-10 gap-4">
  {#if data?.length > 0}
    {#if filteredDoors.length > 0}
      {#each filteredDoors as door, index}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="node flex flex-col justify-center items-center">
          <div
            class={`pt-2 pb-2 px-4 rounded-lg flex flex-col gap-1 cursor-pointer drop-shadow-lg relative w-max bg-[#f9f9f9] border border-black border-opacity-5 text-black dark:bg-[#FFFFFF14] dark:text-white`}
          >
            <span class="flex flex-col items-start">
              <p class="font-semibold text-[18px] text-nowrap">{door.name}</p>
              <p class="text-sm font-medium text-gray-500">
                Address {door.address}
              </p>
            </span>
            <Separator class="my-1" />
            <span class="flex items-center gap-2 justify-between">
              <p class="text-[12px] font-medium">
                <span class="text-gray-500">Version:</span>
                {door.version}
              </p>
              <p class="text-[12px] font-medium">
                <span class="text-gray-500">Sites:</span>
                {door.logicalChildren?.length > 0
                  ? door.logicalChildren.length
                  : "N/A"}
              </p>
              <p class="text-[12px] font-medium">
                <span class="text-gray-500">Unid:</span>
                {door.unid}
              </p>
            </span>
            <Separator class="my-1" />
            <div class="flex justify-between gap-3">
              <CameraDoor
                doorId={door.id}
                doorName={door.name}
                selectedCamerasIdsArr={door.cameraId}
              >
                <Button
                  class="py-1 bg-[#111C09] dark:bg-black dark:text-white flex gap-1.5 items-center"
                  size="sm"
                >
                  <Camera size={18} /> Camera
                </Button>
              </CameraDoor>
              <Button
                class="py-1 bg-[#111C09] dark:bg-black dark:text-white flex gap-1.5 items-center"
                size="sm"
                on:click={() => handleUnlock(door.unid)}
              >
                <LockKeyhole size={18} class="dark:text-white" />
                Unlock Door
              </Button>
            </div>
          </div>
          {#if showChildren === index}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <span class="w-[1px] h-[75px] bg-primary block mx-auto" />
            {#if door.logicalChildren && door.logicalChildren.length > 0}
              <div class="grid grid-cols-3 drop-shadow-lg gap-4">
                {#each door.logicalChildren as child, idx}
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div
                    on:click={() => {
                      if (selectedChild === idx) {
                        selectedChild = null;
                      } else {
                        selectedChild = idx;
                      }
                    }}
                    class={`node border-2 rounded-lg relative flex flex-col col-span-1 p-2`}
                  >
                    <div class="text-sm font-bold">Name: {child.name}</div>
                    <div class="text-xs font-medium">
                      Child ID: {child.unid}
                    </div>
                    <div class="text-xs font-medium">Type: {child.type}</div>
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    {:else}
      <p class="text-brand-foreground dark:text-brand text-xl font-medium">
        No doors with this name found
      </p>
    {/if}
  {:else}
    <p
      class="text-brand-foreground dark:text-brand font-medium text-lg text-center pt-5 w-full"
    >
      No Doors found
    </p>
  {/if}
</div>

<script lang="ts">
    // Imports
    import { Dialog as DialogPrimitive } from "bits-ui";
    import { X } from "lucide-svelte";
    import { Label } from "@/components/ui/label";
    import { Button } from "@/components/ui/button";
    import { writable } from "svelte/store";
    import * as Dialog from "../../ui/dialog";
    import { Plus } from "lucide-svelte";
    import { Checkbox } from "@/components/ui/checkbox";
    import { toast } from "svelte-sonner";
    import pb from "@/lib/pb";
    import { cameras, selectedNode } from "@/stores";
  
    // Props
    export let doorId;
    export let doorName;
    export let selectedCamerasIdsArr;
  
    // Stores
    let dialogOpen = writable(false);
    let selectedCamerasIds = writable<string[]>(selectedCamerasIdsArr || []);

    const storedNode = localStorage.getItem("selectedNode")

    $: storedNode && selectedNode.set(storedNode)

    const addCameras = async () => {
      let label = $selectedCamerasIds.length <= 1 ? "Camera" : "Cameras";
  
      await pb.collection("atlas_door")
        .update(doorId, { cameraId: $selectedCamerasIds })
        .then(() => {
          $selectedCamerasIds.map(async (cameraId) => {
            await pb.collection("camera").update(cameraId, { doorId });
          });
          toast.success(
            `${$selectedCamerasIds.length} ${label} added to ${doorName}`,
          );
        })
        .catch((err) => {
          console.log("Failed to add cameras", err);
          toast.error(`Failed to add ${label}`);
        });
      dialogOpen.set(false);
    };
  
    const handleCheckboxChange = (cameraId: string, ischecked: boolean) => {
      if (ischecked) {
        selectedCamerasIds.update((ids) => [...ids, cameraId]);
      } else {
        selectedCamerasIds.update((ids) => ids.filter((id) => id !== cameraId));
      }
    };
  </script>
  
  <Dialog.Root bind:open={$dialogOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content
      class="sm:max-w-[600px] scale-90 sm:scale-100 p-0"
      closeButton={false}
      roundedLarge={true}
    >
      <Dialog.Header>
        <div class="h-4 w-full rounded-t-3xl"></div>
        <Dialog.Title class="flex justify-between w-full items-center px-6 pt-4"
          >Add Cameras to Door
          <DialogPrimitive.Close
            class="rounded-full p-1 bg-gray-300 dark:bg-gray-800"
          >
            <X class="size-5 font-thin" />
          </DialogPrimitive.Close>
        </Dialog.Title>
      </Dialog.Header>
      {#if $cameras.length <= 0}
        <p class="text-primary p-5">No Cameras to add</p>
      {:else}
        <form
          on:submit={addCameras}
          class="flex gap-8 flex-row w-full flex-wrap items-center justify-start p-5 mx-6"
        >
          {#each $cameras as camera, index}
            <div class="flex flex-row gap-2 items-center">
              <!-- Checkbox from shadcn -->
              <Checkbox
                id={`camera-checkbox-${index}`}
                checked={$selectedCamerasIds.includes(camera.id)}
                onCheckedChange={(e) => handleCheckboxChange(camera.id, e)}
              />
              <Label for={`camera-checkbox-${index}`} class="capitalize"
                >{camera.name}</Label
              >
            </div>
          {/each}
        </form>
  
        <Dialog.Footer class="px-6 pb-6">
          <span class="flex items-center gap-4">
            <Button on:click={() => dialogOpen.set(false)} variant="secondary"
              >Cancel</Button
            >
            <Button
            variant={"default"}
              type="submit"
              class="mt-auto flex items-center gap-1 w-full"
              on:click={(e) => {
                e.preventDefault();
                addCameras();
              }}
            >
              <Plus size={16} />
              Add Cameras
            </Button>
          </span>
        </Dialog.Footer>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
  
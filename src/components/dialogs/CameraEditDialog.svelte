<script lang="ts">
  export let cameraId: string;
  export let name: string;
  export let url: string;
  export let role: string;
  export let subUrl: string;

  let dialogOpen: boolean = false;

  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";

  const editCamera = () => {
    if(role === 'superAdmin'){
    fetch("/api/camera/editCamera", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameraId,
        nodeId: $selectedNode.id,
        name,
        url,
        subUrl
      }),
    }).then(() => {
      toast("Camera edited");
    });  
    } else {
      fetch("/api/camera/editCamera", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameraId,
        nodeId: $selectedNode.id,
        name,
        url,
      }),
    }).then(() => {
      toast("Camera edited");
    });
    }
    
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger class='flex items-center gap-2'><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Edit Camera</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-4 py-4 ">
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="node-name">Name</Label>
        <Input type="text" bind:value={name} class="text-base"/>
      </div>
      {#if role === 'superAdmin'}
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="node-name">Url</Label>
        <Input type="text" bind:value={url} class="text-base"/>
      </div>
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="node-name">Sub Url</Label>
        <Input type="text" bind:value={subUrl} class="text-base"/>
      </div>
      {/if}
    </div>

    <Dialog.Footer>
      <span class="flex items-center gap-4">
        <Button
          on:click={() => {
            dialogOpen = false;
          }}
          variant="secondary">Cancel</Button
        >
        <Button on:click={editCamera}>Save Changes</Button>
      </span>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

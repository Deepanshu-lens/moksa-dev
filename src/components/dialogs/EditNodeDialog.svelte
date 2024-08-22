<script lang="ts">
  let dialogOpen: boolean = false;

  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  let newName: string = "";

  const editCamera = () => {
    fetch("/api/node/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        id: $selectedNode.id,
      }),
    }).then(() => {
      toast("Camera edited");
      dialogOpen =false
    });
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Edit Node name</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-4 py-4">
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="node-name">Name</Label>
        <Input type="text" bind:value={newName} class="text-base" />
      </div>
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

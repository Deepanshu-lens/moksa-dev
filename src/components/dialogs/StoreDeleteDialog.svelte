<script lang="ts">
    export let name:string
    export let moksaId;
    export let id;
  let dialogOpen: boolean = false;

  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Button } from "@/components/ui/button";
  import { addUserLog } from "@/lib/addUserLog";

  const deleteCamera = () => {
    console.log("deleted", name, moksaId, id);
    fetch("/api/store/delete", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moksaId,   
        id,
      }),
    }).then(() => {
      toast("Selected store Deleted!");
      addUserLog(`user deleted store with name ${name} & moksaId ${moksaId}`);
      dialogOpen = false;
    });
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Delete Store : {name}</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2">
      <div class="col-span-2 dark:text-white text-black">
        Are you sure you would like to delete Store with ::
        <span class="font-medium">
          name = <span class="font-semibold text-primary">
            {name}
          </span>
        </span>
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
        <Button on:click={deleteCamera} variant="destructive">Delete</Button>
      </span>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<script lang="ts">
  export let cameraId: string;
  export let nodeId: string;
  export let url: string;
  export let name: string;
  let dialogOpen: boolean = false;

  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { addUserLog } from "@/lib/addUserLog";

  const deleteCamera = () => {
    console.log("deleted", name, cameraId, nodeId, url);
    fetch("/api/camera/deleteCamera", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameraId,
        nodeId,
        url,
      }),
    }).then(() => {
      toast("Selected camera Deleted!");
      addUserLog(`user deleted camera with name ${name} & url ${url}`);
    });
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Delete Camera : {name}</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2">
      <div class="col-span-2 dark:text-white text-black">
        Are you sure you would like to delete Camera with : <br />
        <span class="font-medium">
          name : <span class="font-semibold text-primary">
            {name}
          </span>
          &
        </span>
        <br />
        <span class=" font-medium">
          url : <span class="text-primary font-semibold">
            {url}
          </span>
          ?
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

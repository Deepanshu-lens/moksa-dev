<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  let cameraName = "";
  let cameraURL = "";
  let dialogOpen = false;
  const onDeleteAllEvents = () => {};
  const onSubmit = () =>
    fetch("/api/camera/addCamera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cameraName,
        url: cameraURL,
        nodeId: selectedNode.id,
      }),
    }).then((response) => {
      if (response.ok) {
        dialogOpen = false;
      }
      toast("Camera added");
    });
</script>

<!-- markup (zero or more items) goes here -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Alert Settings</Dialog.Title>
      <Dialog.Description>
        Insert a new camera in <span class="font-semibold"
          >{$selectedNode.name}</span
        >
        node
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="camera-name">Name</Label>
        <Input
          id="camera-name"
          placeholder={"Home-Porch"}
          class="col-span-3"
          bind:cameraName
          on:change={(e) => (cameraName = e.target.value)}
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="camera-url">URL</Label>
        <Input
          name="camera-url"
          class="col-span-3"
          placeholder={"rtsp://admin:password@123.123.123.123/stream/1"}
          on:change={(e) => (cameraURL = e.target.value)}
          on:keyup={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button type="submit" on:click={onSubmit}>Add Camera</Button>
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>



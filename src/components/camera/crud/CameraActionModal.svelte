<script lang="ts">
  import pb from "@/lib/pb";
  import { selectedNode } from "@/stores";
  import * as Dialog from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import AddCameraForm from "@/components/forms/CameraForm.svelte";

  import { Input } from "@/components/ui/input";
  import * as AlertDialog from "@/components/ui/alert-dialog";
  import { Label } from "@/components/ui/label";
  import { cameraSchema } from "@/types";

  import { createForm } from "felte";
  import { validator } from "@felte/validator-zod";

  export let action: "add" | "edit" | "delete";
  export let camera;

  let modalOpen = false;

  let cameraName = camera ? camera.name : "";
  let mainUrl = camera ? camera.url : "";
  let subUrl = camera ? camera.subUrl : "";
  let doneSubmit = false;

  const { form, errors, reset, isSubmitting } = createForm({
    initialValues: { name: cameraName, url: mainUrl, subUrl: subUrl },
    // extend: validator({ schema: cameraSchema.schema.omit({ id: true }) }),
    onSubmit: async (values) => {
      console.log(cameraSchema.schema.omit({ id: true }).safeParse(values));
      console.log("Form submitted with:", values);
      const data = {
        name: cameraName,
        url: mainUrl,
        subUrl,
        motionSensitivity: 33, // Example value
        node: $selectedNode,
      };

      // Push the data to Pocketbase (to the 'cameras' collection, for example)
      const record = await pb.collection("camera").update(camera.id, data);
      modalOpen = false;
      const streamElement = document.getElementById(`stream-${camera.id}`);
      if (streamElement) {
        streamElement.setAttribute(
          "data-url",
          `
wss://view.lenscorp.cloud/api/ws?src=${camera.id}`
        );
      }
    },
    onError: (err) => {
      console.error("Form validation failed:", err);
    },
  });

  const deleteCamera = async () => {
    const record = await pb.collection("camera").delete(camera.id);
  };

  $: {
    if (doneSubmit) {
      modalOpen = false;
      doneSubmit = false;
    }
  }
</script>

{#if action === "add"}
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title class="border-b pb-4">Add Camera</Dialog.Title>
      </Dialog.Header>
      <AddCameraForm bind:cameraName bind:mainUrl bind:subUrl bind:doneSubmit />
    </Dialog.Content>
  </Dialog.Root>
{:else if action === "edit"}
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title class="border-b pb-4">Edit Camera</Dialog.Title>
      </Dialog.Header>
      <form use:form class="space-y-4 mt-4">
        <div class="flex items-center justify-between pb-4">
          <Label>Camera Name</Label>
          <div class="w-full">
            <Input
              type="text"
              name="name"
              placeholder="Home-Garage"
              class=""
              bind:value={cameraName}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.name}
                {$errors.name}
              {/if}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pb-4">
          <Label>Main URL</Label>
          <div class="w-full">
            <Input
              type="text"
              name="url"
              placeholder="rtsp://admin:password@123.123.123.123/stream/1"
              class="text-xs"
              bind:value={mainUrl}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.url}
                {$errors.url}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pb-4">
          <Label>Sub URL</Label>
          <div class="w-full">
            <Input
              type="text"
              name="subUrl"
              placeholder="rtsp://admin:password@123.123.123.123/stream/2"
              class=" text-xs"
              bind:value={subUrl}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.subUrl}
                {$errors.subUrl}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex flex-1 flex-col mx-auto">
          <Button type="submit" variant="brand">Confirm</Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <AlertDialog.Root>
    <AlertDialog.Trigger><slot /></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description>
          Deleting a camera cannot be undone. This will permanently delete your
          camera from our servers.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          on:click={deleteCamera}
          class="bg-rose-500 text-white">Delete</AlertDialog.Action
        >
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}

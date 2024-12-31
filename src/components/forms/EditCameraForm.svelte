<script lang="ts">
  import { createForm } from "felte";
  import { writable } from "svelte/store";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { toast } from "svelte-sonner";
  import pb from "@/lib/pb"; // Assuming you have a Pocketbase instance
  import { user } from "@/stores";
  import { addUserLogs } from "@/lib/logs/userLogs";

  export let camera;
  export let modalOpen;

  let cameraName = writable(camera?.name);
  let mainUrl = writable(camera?.url);
  let subUrl = writable(camera?.subUrl);

  const { form, errors, reset } = createForm({
    initialValues: { name: $cameraName, url: $mainUrl, subUrl: $subUrl },
    onSubmit: async (values) => {
      const data = {
        name: values.name,
        url: values.url,
        subUrl: values.subUrl,
      };

      try {
        await pb.collection("camera").update(camera.id, data);
        modalOpen.set(false);
        addUserLogs("Camera updated successfully", $user?.email || "", $user?.id || "");
        toast.success("Camera updated successfully!");
      } catch (error) {
        toast.error("Failed to update camera.");
        console.error(error);
      }
    },
    onError: (err) => {
      console.error("Form validation failed:", err);
    },
  });

  // Reset form values when the camera prop changes
  $: if (camera) {
    reset({ name: camera.name, url: camera.url, subUrl: camera.subUrl });
  }
</script>

<form use:form class="space-y-4 mt-4">
  <div class="flex items-center justify-between pb-4">
    <Label>Camera Name</Label>
    <div class="w-full">
      <Input
        type="text"
        name="name"
        placeholder="Home-Garage"
        bind:value={$cameraName}
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
        bind:value={$mainUrl}
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
        bind:value={$subUrl}
      />
      <div class="text-rose-500 text-xs pt-2">
        {#if $errors.subUrl}
          {$errors.subUrl}
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-1 flex-col mx-auto">
    <Button type="submit" variant="brand">Update Camera</Button>
  </div>
</form>

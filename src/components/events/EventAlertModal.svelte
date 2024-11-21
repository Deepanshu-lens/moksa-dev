<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import type { Event } from "@/types";
  import * as Tabs from "@/components/ui/tabs";
  export let event: Event;
  export let onClose: () => void;
  let modalOpen = true;
  $: if (!modalOpen) onClose();
</script>

<Dialog.Root bind:open={modalOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="p-6 max-w-2xl mx-auto rounded-lg shadow-lg">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-bold border-b pb-4 mb-4">
        {event.title || "Event Details"}
      </Dialog.Title>
    </Dialog.Header>

    <Tabs.Root class="w-full">
      <Tabs.List class="w-full">
        <Tabs.Trigger value="images" class="w-1/2">Images</Tabs.Trigger>
        <Tabs.Trigger value="videos" class="w-1/2">Videos</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="images">
        <!-- Large Image -->
        <img
          src={"data:image/jpeg;base64," + event.frameImage}
          alt={event.title || "Event Image"}
          class="w-full h-auto rounded-lg object-cover mb-4"
        />
      </Tabs.Content>
      <Tabs.Content value="videos">
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={event.videoPath} class="w-full h-auto rounded-lg object-cover mb-4" controls></video>
      </Tabs.Content>
    </Tabs.Root>

    <!-- Event Details -->
    <div class="space-y-2">
      <p><strong>Confidence:</strong> {Math.round(event.score * 100)}%</p>
      <p><strong>Severity:</strong> {event.severity || "N/A"}</p>
      <p>
        <strong>Description:</strong>
        {event.description || "No description available."}
      </p>
      <p>
        <strong>Timestamp:</strong>
        {new Date(event.created).toLocaleString()}
      </p>
    </div>
  </Dialog.Content>
</Dialog.Root>

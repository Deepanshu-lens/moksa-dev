<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import type { Event } from "@/types";
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

    <!-- Large Image -->
    <img
      src={"data:image/jpeg;base64," + event.frameImage}
      alt={event.title || "Event Image"}
      class="w-full h-auto rounded-lg object-cover mb-4"
    />

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

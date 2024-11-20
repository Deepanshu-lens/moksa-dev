<script lang="ts">
  // Import
  import * as Dialog from "../../../components/ui/dialog";
  import { imageUrl } from "@/stores";
  // variables
  export let loading;

  const imageHandler = (open: boolean) => {
    if (!open) {
      imageUrl.set("");
    }
  };
</script>

<Dialog.Root onOpenChange={imageHandler}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[600px] z-[70] ">
    <Dialog.Header>
      <Dialog.Title>Heat Map</Dialog.Title>
    </Dialog.Header>
    <div class="">
      {#if loading}
        <p>Fetching ...</p>
      {:else if !$imageUrl}
        <div>No Image</div>
      {:else}
        <img
          src={"data:image/jpeg;base64," + $imageUrl}
          alt="Event"
          class="w-full h-auto max-h-[350px]"
          loading="lazy"
        />
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
